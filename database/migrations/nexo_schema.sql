-- =====================================================
-- Nexo Sinérgico Database Schema
-- Editorial Industrial Cognitiva System
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table 1: PROJECTS
-- Stores industrial projects/facilities
-- =====================================================
CREATE TABLE IF NOT EXISTS nexo_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    facility_type VARCHAR(100), -- e.g., 'PYROLYSIS', 'RECYCLING', 'BIOREFINERY'
    owner_id UUID, -- Link to your existing users table if you have one
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Table 2: AI GENERATIONS
-- Complete log of each AI generation attempt
-- Tracks "genealogy" for continuous learning
-- =====================================================
CREATE TABLE IF NOT EXISTS nexo_ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES nexo_projects(id) ON DELETE CASCADE,
    
    -- Genealogy: Track if this is a regeneration/correction
    parent_generation_id UUID REFERENCES nexo_ai_generations(id),
    iteration_index INT DEFAULT 1, -- 1 = Original, 2 = Correction 1, etc.
    
    -- Telemetry Snapshot (Hard Data)
    -- Example: {"demand_kw": 385, "cost_eur": 184000, "efficiency": 0.06, "machine_status": "OPTIMAL"}
    telemetry_snapshot JSONB NOT NULL,
    
    -- Engine Configuration (How the VisualMetaphorEngine was configured)
    -- Example: {"audience": "INVESTOR", "style_preset": "CYBERPUNK_DARK", "model_version": "gemini-1.5-pro"}
    engine_config JSONB NOT NULL,
    
    -- The actual prompt sent to Gemini
    full_prompt_text TEXT NOT NULL,
    negative_prompt_text TEXT,
    
    -- Generation Results
    output_url TEXT, -- URL to generated image in Cloudinary/S3
    output_metadata JSONB, -- {"seed": 12345, "model": "gemini", "generation_time_ms": 4500}
    
    -- Narrative Content Generated
    narrative_headline VARCHAR(255),
    narrative_sub_headline VARCHAR(255),
    narrative_body_markdown TEXT,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'COMPLETED', 'FAILED'
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Table 3: AI FEEDBACK
-- User votes and comments for continuous learning
-- Only filled when user interacts (votes/regenerates)
-- =====================================================
CREATE TABLE IF NOT EXISTS nexo_ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID REFERENCES nexo_ai_generations(id) ON DELETE CASCADE,
    
    -- User sentiment: -1 (thumbs down), 0 (neutral), 1 (thumbs up)
    sentiment INT CHECK (sentiment IN (-1, 0, 1)),
    
    -- User-selected tags for what was wrong/right
    -- Example: ["TOO_DARK", "ABSTRACT"], or ["PERFECT", "PROFESSIONAL"]
    tags TEXT[],
    
    -- Free-form user comment
    user_comment TEXT,
    
    -- Action taken after feedback
    action_taken VARCHAR(50), -- 'REGENERATED', 'ACCEPTED', 'DISMISSED'
    
    -- Track which user provided feedback (if you have user auth)
    user_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Performance Indexes
-- =====================================================

-- GIN indexes for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_telemetry_snapshot_gin 
ON nexo_ai_generations USING GIN (telemetry_snapshot);

CREATE INDEX IF NOT EXISTS idx_engine_config_gin 
ON nexo_ai_generations USING GIN (engine_config);

-- Regular indexes for common queries
CREATE INDEX IF NOT EXISTS idx_generations_project_id 
ON nexo_ai_generations(project_id);

CREATE INDEX IF NOT EXISTS idx_generations_created_at 
ON nexo_ai_generations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_generation_id 
ON nexo_ai_feedback(generation_id);

CREATE INDEX IF NOT EXISTS idx_feedback_sentiment 
ON nexo_ai_feedback(sentiment);

-- =====================================================
-- Sample Data Insertion (for testing)
-- =====================================================

-- Insert a test project
INSERT INTO nexo_projects (name, description, facility_type)
VALUES (
    'Proyecto Biomasa Algas 2024',
    'Planta piloto de pirólisis de biomasa marina',
    'PYROLYSIS'
) ON CONFLICT DO NOTHING;

-- Note: Sample generation and feedback insertions should be done
-- via the Python backend to ensure proper data validation

-- =====================================================
-- Useful Queries for Development
-- =====================================================

-- Get all generations for a project with their feedback count
-- SELECT 
--     g.id, 
--     g.narrative_headline,
--     g.created_at,
--     COUNT(f.id) as feedback_count
-- FROM nexo_ai_generations g
-- LEFT JOIN nexo_ai_feedback f ON f.generation_id = g.id
-- WHERE g.project_id = 'YOUR_PROJECT_UUID'
-- GROUP BY g.id
-- ORDER BY g.created_at DESC;

-- Find generations with negative feedback for retraining
-- SELECT 
--     g.id,
--     g.telemetry_snapshot,
--     g.engine_config,
--     f.tags,
--     f.user_comment
-- FROM nexo_ai_generations g
-- JOIN nexo_ai_feedback f ON f.generation_id = g.id
-- WHERE f.sentiment = -1;
