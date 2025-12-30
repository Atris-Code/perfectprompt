"""
Nexo Sinérgico - Visual Metaphor Engine
The "Semantic Translator" that converts hard industrial data into soft aesthetic descriptors.

This module converts values like "0.06 €/kWh" (cheap/efficient) into visual concepts
like "aerodynamic", "frictionless flow", or "clean blue light".
"""
from typing import Dict, Any


class VisualMetaphorEngine:
    """
    Translates industrial telemetry data into visual metaphors for AI image generation.
    """
    
    def __init__(self):
        """Initialize with predefined style templates for different audiences"""
        self.styles = {
            "INVESTOR": (
                "isometric 3D render, unreal engine 5, corporate minimalism, "
                "clean white background, golden accents, premium feel"
            ),
            "ENGINEER": (
                "blueprint schematic style, cyanotype, technical drawing, "
                "precise lines, white grid on blue, annotations"
            ),
            "MARKETING": (
                "cinematic hyperrealistic photography, depth of field, "
                "golden hour lighting, futuristic sustainability, hero shot"
            )
        }
    
    def determine_visual_mood(self, efficiency_rate: float) -> Dict[str, str]:
        """
        Translates efficiency (price/kWh) into 'Visual Mood'.
        
        Args:
            efficiency_rate: Cost per kWh (e.g., 0.06 for €0.06/kWh)
        
        Returns:
            Dictionary with adjectives, color_palette, and chaos_level
        """
        # Benchmark: 0.10 €/kWh is market standard
        MARKET_BENCHMARK = 0.10
        
        if efficiency_rate <= 0.07:
            # CASE: Highly Efficient (Your current case)
            return {
                "adjectives": "frictionless, aerodynamic, glowing, crystalline, levitating",
                "color_palette": "electric blue, pure white, and holographic silver",
                "chaos_level": "--s 50",  # Stylized, orderly
                "mood": "powerful yet serene"
            }
        elif efficiency_rate > 0.12:
            # CASE: Inefficient / Expensive
            return {
                "adjectives": "heavy, complex, dense, industrial smoke, friction, sparks",
                "color_palette": "warning orange, dark grey, rusty metal",
                "chaos_level": "--s 250",  # More visually chaotic
                "mood": "struggling, working hard"
            }
        else:
            # CASE: Standard
            return {
                "adjectives": "solid, metallic, structured, balanced",
                "color_palette": "steel grey and navy blue",
                "chaos_level": "--s 100",
                "mood": "stable and reliable"
            }
    
    def determine_core_object(self, power_demand_kw: float) -> str:
        """
        Determines central metaphor object based on power scale.
        
        Args:
            power_demand_kw: Power demand in kilowatts
        
        Returns:
            Description of core visual object
        """
        if power_demand_kw > 500:
            return "a massive pulsing energetic reactor core with lightning arcs"
        elif power_demand_kw > 200:
            return "a powerful spinning turbine with glowing energy rings"
        elif power_demand_kw > 50:
            return "a compact efficient energy cell with flowing circuits"
        else:
            return "a sleek minimalist power node with subtle glow"
    
    def generate_visual_prompt(
        self, 
        data_context: Dict[str, Any], 
        audience: str = "INVESTOR"
    ) -> str:
        """
        Constructs the full visual prompt for Gemini image generation.
        
        Args:
            data_context: Dictionary containing telemetry data
            audience: Target audience ("INVESTOR", "ENGINEER", "MARKETING")
        
        Returns:
            Complete prompt string for Gemini API
        """
        # Extract key metrics
        inputs = data_context.get('inputs', {})
        results = data_context.get('calculated_results', {})
        
        power_demand = inputs.get('demand_power_kw', inputs.get('demand_kw', 0))
        elec_rate = inputs.get('electricity_rate_eur_kwh', inputs.get('efficiency_rate', 0.10))
        
        # Determine visual elements
        mood = self.determine_visual_mood(elec_rate)
        core_object = self.determine_core_object(power_demand)
        style = self.styles.get(audience, self.styles["INVESTOR"])
        
        # Construct the prompt
        prompt = f"""
Subject: {core_object}

Mood: {mood['mood']}

Adjectives: {mood['adjectives']}

Color Palette: {mood['color_palette']}

Style: {style}

Composition: Centered hero shot, dramatic lighting from top-left, clean composition

Technical Quality: 8K resolution, ray-traced lighting, physically based rendering

Metaphor Context: This represents an industrial energy system operating at {elec_rate} €/kWh 
with {power_demand} kW power demand. The visual should convey efficiency and modernity.

Negative Prompt: cluttered, messy, low quality, blurry, amateur, text, watermark
        """.strip()
        
        return prompt
    
    def generate_negative_prompt(self) -> str:
        """Standard negative prompt to avoid common image generation issues"""
        return (
            "cluttered, messy, chaotic background, low quality, blurry, out of focus, "
            "amateur photography, text overlay, watermark, logo, signature, "
            "unrealistic lighting, oversaturated, distorted proportions"
        )


# Example usage
if __name__ == "__main__":
    engine = VisualMetaphorEngine()
    
    # Test with sample data from Utilities module
    test_data = {
        "inputs": {
            "demand_power_kw": 385,
            "electricity_rate_eur_kwh": 0.06,
            "annual_hours": 8000
        },
        "calculated_results": {
            "hourly_cost_eur": 23.10,
            "annual_cost_eur": 184800.00
        }
    }
    
    
    print("=== Testing Visual Metaphor Engine ===\n")
    
    # Test different audiences
    for audience in ["INVESTOR", "ENGINEER", "MARKETING"]:
        prompt = engine.generate_visual_prompt(test_data, audience)
        print(f"--- {audience} ---")
        print(prompt)
        print("\n")
