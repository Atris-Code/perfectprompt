"""
Nexo Sinérgico - Main Engine
Core orchestrator that processes payloads and generates InsightCard responses.
"""
import google.generativeai as genai
from typing import Dict, Any, Optional
import json
from datetime import datetime
import uuid

from .semantic_translator import VisualMetaphorEngine
from .models import (
    NexoPayload,
    InsightCardResponse,
    VisualAsset,
    NarrativeContent,
    UIHints,
    Action,
    HighlightedMetric
)
from .config import settings


class NexoSinergicoEngine:
    """
    Main orchestration engine for the Nexo Sinérgico system.
    Processes telemetry data and generates multimedia editorial content.
    """
    
    def __init__(self):
        """Initialize the engine with Gemini API"""
        genai.configure(api_key=settings.gemini_api_key)
        self.visual_engine = VisualMetaphorEngine()
        
        # Initialize Gemini models
        self.text_model = genai.GenerativeModel('gemini-1.5-pro')
        # TODO: Implement actual image generation
        # self.image_model = genai.ImageGenerationModel('imagen-3.0-generate-001')
    
    async def process_request(self, payload: NexoPayload) -> InsightCardResponse:
        """
        Main processing pipeline for insight generation.
        
        Args:
            payload: Complete request payload from frontend
        
        Returns:
            InsightCardResponse ready for frontend display
        """
        # 1. Extract and enrich data
        insights = self.calculate_benchmarks(payload.data_context)
        
        # 2. Generate narrative text
        narrative = await self.generate_narrative(payload, insights)
        
        # 3. Generate visual metaphor
        visual = await self.generate_visual(payload)
        
        # 4. Construct UI hints
        ui_hints = self.create_ui_hints(payload, insights)
        
        # 5. Define available actions
        actions = self.create_actions()
        
        # 6. Assemble response
        response = InsightCardResponse(
            request_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow().isoformat() + "Z",
            status="success",
            generated_for_role=payload.user_intent.target_audience,
            visual_asset=visual,
            narrative_content=narrative,
            ui_hints=ui_hints,
            available_actions=actions
        )
        
        return response
    
    def calculate_benchmarks(self, data_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate business insights before feeding to AI.
        Determines if costs are good/bad compared to market benchmarks.
        
        Args:
            data_context: Contains inputs and calculated_results
        
        Returns:
            Dictionary with benchmark comparisons and ratings
        """
        inputs = data_context.get('inputs', {})
        results = data_context.get('calculated_results', {})
        
        # Market benchmark: 0.10 €/kWh
        market_rate = 0.10
        current_rate = inputs.get('electricity_rate_eur_kwh', inputs.get('efficiency_rate', market_rate))
        
        # Calculate savings percentage
        if current_rate < market_rate:
            savings_pct = ((market_rate - current_rate) / market_rate) * 100
            comparison = "BELOW_MARKET"
            rating = "EXCELLENT" if savings_pct > 30 else "GOOD"
        elif current_rate > market_rate:
            excess_pct = ((current_rate - market_rate) / market_rate) * 100
            comparison = "ABOVE_MARKET"
            rating = "POOR"
            savings_pct = -excess_pct
        else:
            comparison = "AT_MARKET"
            rating = "STANDARD"
            savings_pct = 0
        
        return {
            "market_comparison": comparison,
            "savings_percentage": round(savings_pct, 1),
            "rating": rating,
            "current_rate": current_rate,
            "market_rate": market_rate
        }
    
    async def generate_narrative(
        self, 
        payload: NexoPayload, 
        insights: Dict[str, Any]
    ) -> NarrativeContent:
        """
        Generate narrative content using Gemini text model.
        
        Args:
            payload: Original request payload
            insights: Calculated benchmarks
        
        Returns:
            NarrativeContent with headline, body, and metrics
        """
        results = payload.data_context.get('calculated_results', {})
        inputs = payload.data_context.get('inputs', {})
        
        # Construct prompt for narrative
        prompt = f"""
You are an industrial data journalist writing for {payload.user_intent.target_audience}.
Tone: {payload.user_intent.tone}

Context:
- Annual Cost: {results.get('annual_cost_eur', 'N/A')} €
- Hourly Cost: {results.get('hourly_cost_eur', 'N/A')} €/h
- Electricity Rate: {inputs.get('electricity_rate_eur_kwh', 'N/A')} €/kWh
- Market Comparison: {insights['market_comparison']}
- Savings vs Market: {insights['savings_percentage']}%
- Rating: {insights['rating']}

Task: Write a compelling 3-part narrative:

1. HEADLINE: One powerful sentence (max 8 words) capturing the key insight
2. SUB_HEADLINE: One sentence explaining the benefit (max 15 words)
3. BODY: Two sentences of analysis with ** markdown bold ** for key metrics

Output format (JSON):
{{
  "headline": "...",
  "sub_headline": "...",
  "body_markdown": "..."
}}

Focus on financial impact and operational excellence.
        """.strip()
        
        try:
            response = await self.text_model.generate_content_async(prompt)
            
            # Parse JSON response
            text = response.text.strip()
            # Remove markdown code blocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            
            narrative_data = json.loads(text.strip())
            
            # Create highlighted metrics
            metrics = [
                HighlightedMetric(
                    label="Tarifa",
                    value=f"{inputs.get('electricity_rate_eur_kwh', 0):.2f} €/kWh",
                    trend="positive" if insights["rating"] == "EXCELLENT" else "neutral"
                ),
                HighlightedMetric(
                    label="Ahorro Est.",
                    value=f"{abs(insights['savings_percentage']):.0f}%",
                    trend="positive" if insights['savings_percentage'] > 0 else "negative"
                )
            ]
            
            return NarrativeContent(
                headline=narrative_data.get('headline', 'Análisis Energético'),
                sub_headline=narrative_data.get('sub_headline', ''),
                body_markdown=narrative_data.get('body_markdown', ''),
                call_to_action="Recomendamos optimizar contratos energéticos.",
                highlighted_metrics=metrics
            )
            
        except Exception as e:
            # Fallback narrative
            return NarrativeContent(
                headline="Análisis de Eficiencia Energética",
                sub_headline=f"Operación al {abs(insights['savings_percentage']):.0f}% vs mercado",
                body_markdown="El análisis muestra **rendimiento notable** en gestión de costos energéticos.",
                highlighted_metrics=[]
            )
    
    async def generate_visual(self, payload: NexoPayload) -> VisualAsset:
        """
        Generate visual metaphor using Gemini image model.
        
        Args:
            payload: Original request payload
        
        Returns:
            VisualAsset with generated image URL
        """
        # Generate prompt using VisualMetaphorEngine
        audience = payload.user_intent.target_audience.split("_")[0]  # Extract "INVESTOR" from "CFO_INVESTORS"
        visual_prompt = self.visual_engine.generate_visual_prompt(
            payload.data_context,
            audience
        )
        
        try:
            # Call Gemini image generation
            # NOTE: This is a placeholder - actual Gemini Imagen API integration needed
            # For now, return a working placeholder image URL
            image_url = "https://via.placeholder.com/1200x675/1e293b/00d4ff?text=NEXO+SINERGICO+-+Industrial+Energy+Analysis"
            
            return VisualAsset(
                type="image/png",
                url=image_url,
                alt_text=f"Visualización metafórica de eficiencia energética industrial",
                prompt_used=visual_prompt[:200] + "...",  # Truncate for UI
                aspect_ratio="16:9"
            )
            
        except Exception as e:
            # Fallback to placeholder
            return VisualAsset(
                type="image/png",
                url="https://via.placeholder.com/1200x675/0d1b2a/00d4ff?text=Industrial+Energy+Visualization",
                alt_text="Placeholder visualization",
                prompt_used=visual_prompt[:200] + "...",
                aspect_ratio="16:9"
            )
    
    def create_ui_hints(self, payload: NexoPayload, insights: Dict[str, Any]) -> UIHints:
        """
        Create UI styling hints based on data quality.
        
        Args:
            payload: Original request payload
            insights: Calculated benchmarks
        
        Returns:
            UIHints with colors and styling
        """
        # Choose colors based on performance rating
        if insights["rating"] == "EXCELLENT":
            primary_color = "#00D4FF"  # Cyan - excellent
            secondary_color = "#00FF88"  # Green - success
            border_style = "glowing_cyan"
        elif insights["rating"] == "GOOD":
            primary_color = "#00D4FF"  # Cyan
            secondary_color = "#FFC107"  # Amber - warning
            border_style = "glowing_cyan"
        else:
            primary_color = "#FF6B6B"  # Red - alert
            secondary_color = "#FFC107"  # Amber
            border_style = "glowing_red"
        
        return UIHints(
            theme_mode="dark_cyberpunk",
            primary_color_hex=primary_color,
            secondary_color_hex=secondary_color,
            card_border_style=border_style,
            icon="lightning-bolt-shield"
        )
    
    def create_actions(self) -> list[Action]:
        """Create available user actions"""
        return [
            Action(
                id="download_pdf",
                label="Descargar Reporte",
                icon="download"
            ),
            Action(
                id="share_linkedin",
                label="Publicar Hito",
                icon="share"
            ),
            Action(
                id="regenerate",
                label="Regenerar",
                icon="refresh"
            )
        ]
