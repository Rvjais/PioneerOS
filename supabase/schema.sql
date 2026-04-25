-- PioneerOS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ ENUMS ============

CREATE TYPE user_role AS ENUM ('super_admin', 'mash', 'operations', 'freelancer');
CREATE TYPE department AS ENUM ('web', 'seo', 'ads', 'social_media', 'hr', 'sales', 'admin');
CREATE TYPE client_tier AS ENUM ('enterprise', 'premium', 'standard');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'verified', 'rejected');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue', 'partial');
CREATE TYPE meeting_type AS ENUM ('strategic', 'tactical', 'operations', 'huddle');
CREATE TYPE employee_status AS ENUM ('candidate', 'day0_pending', 'system_ready', 'active', 'resigned', 'terminated');

-- ============ ENTITY A: EMPLOYEES ============

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'operations',
  department department,
  sub_department TEXT,
  status employee_status NOT NULL DEFAULT 'candidate',
  phone TEXT,
  avatar_url TEXT,

  -- Day 0 Verification
  aadhar_verified BOOLEAN DEFAULT FALSE,
  pan_verified BOOLEAN DEFAULT FALSE,
  salary_slips_verified BOOLEAN DEFAULT FALSE,
  nda_signed BOOLEAN DEFAULT FALSE,
  policy_charter_signed BOOLEAN DEFAULT FALSE,

  -- Biometric & Attendance
  biometric_id TEXT,
  myzen_id TEXT,
  last_punch_in TIMESTAMPTZ,
  last_punch_out TIMESTAMPTZ,

  -- RBC Loyalty Pot (8%)
  rbc_pot_balance DECIMAL(12,2) DEFAULT 0,
  rbc_eligible_date DATE,

  -- Performance
  xp_points INTEGER DEFAULT 0,
  hp_points INTEGER DEFAULT 100,
  charter_score DECIMAL(3,2) DEFAULT 0,
  learning_hours_completed DECIMAL(5,2) DEFAULT 0,

  -- Automation
  wa_notifications_enabled BOOLEAN DEFAULT TRUE,
  last_ai_query TIMESTAMPTZ,

  -- Metadata
  joining_date DATE,
  reporting_to UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ENTITY B: CLIENTS ============

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  tier client_tier NOT NULL DEFAULT 'standard',

  -- Healthcare Intelligence
  medical_specialty TEXT,
  clinic_type TEXT,
  patient_volume TEXT,
  target_demographics TEXT,
  competitor_analysis TEXT,
  strategy_map JSONB,

  -- Payment Health
  payment_status payment_status DEFAULT 'pending',
  monthly_retainer DECIMAL(12,2) DEFAULT 0,
  last_payment_date DATE,
  outstanding_amount DECIMAL(12,2) DEFAULT 0,

  -- Assignment
  assigned_team UUID[],
  account_manager_id UUID REFERENCES user_profiles(id),

  -- Tools
  active_tools TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  intake_step INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ENTITY C: WORK (Tasks) ============

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES user_profiles(id),
  assigned_by UUID NOT NULL REFERENCES user_profiles(id),
  department department NOT NULL,

  -- Unit-Based System
  task_type TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  unit_value DECIMAL(10,2) DEFAULT 0,

  -- Status & Deadlines
  status task_status DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES user_profiles(id),

  -- Gantt Support
  start_date TIMESTAMPTZ,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  dependencies UUID[],

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ STOP MEETINGS ============

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type meeting_type NOT NULL,
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,

  -- Attendees
  organizer_id UUID NOT NULL REFERENCES user_profiles(id),
  attendees UUID[] NOT NULL,

  -- Content
  agenda TEXT,
  notes TEXT,
  action_items JSONB,

  -- Huddle Specific
  camera_on_detected BOOLEAN,
  punctuality_recorded BOOLEAN,

  -- Tactical Specific
  lead_quality_score INTEGER CHECK (lead_quality_score >= 1 AND lead_quality_score <= 10),
  client_mood TEXT,

  -- Strategic Specific
  quarterly_goals JSONB,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  recording_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ AUTOMATION LOGS ============

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trigger_type TEXT CHECK (trigger_type IN ('huddle_nudge', 'rbc_milestone', 'payment_reminder', 'meeting_summary', 'monthly_report', 'custom')) NOT NULL,
  channel TEXT CHECK (channel IN ('whatsapp', 'email', 'push')) NOT NULL,
  recipient_id UUID REFERENCES user_profiles(id),
  recipient_contact TEXT NOT NULL,
  message_content TEXT NOT NULL,
  delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'read')) DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ PIONEER ACADEMY ============

CREATE TABLE pioneer_academy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'text', 'document', 'interactive')) NOT NULL,
  video_url TEXT,
  content TEXT,
  related_dept department,
  related_form_field TEXT,

  -- KT
  is_kt_content BOOLEAN DEFAULT FALSE,
  uploaded_by UUID REFERENCES user_profiles(id),

  -- Learning Tracking
  estimated_minutes INTEGER DEFAULT 30,
  mandatory BOOLEAN DEFAULT FALSE,

  -- Metadata
  tags TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TOOL REGISTRY ============

CREATE TABLE tool_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name TEXT NOT NULL,
  tool_code TEXT NOT NULL,
  description TEXT,
  monthly_cost DECIMAL(10,2),

  -- Client Association
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

  -- Status
  api_key_status TEXT CHECK (api_key_status IN ('active', 'inactive', 'expired', 'pending')) DEFAULT 'pending',
  health_status TEXT CHECK (health_status IN ('healthy', 'degraded', 'down')) DEFAULT 'healthy',
  last_health_check TIMESTAMPTZ,

  -- Sales Tracking
  activated_by UUID REFERENCES user_profiles(id),
  activation_date DATE,
  incentive_paid BOOLEAN DEFAULT FALSE,

  -- Metadata
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ ARCADE (Gamification) ============

CREATE TABLE arcade_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('appreciation', 'escalation', 'achievement', 'milestone')) NOT NULL,
  xp_change INTEGER DEFAULT 0,
  hp_change INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  awarded_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ SOCIAL FEED ============

CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  post_type TEXT CHECK (post_type IN ('achievement', 'announcement', 'photo', 'update', 'milestone')) NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ POSH COMPLAINTS (Encrypted) ============

CREATE TABLE posh_complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complainant_id UUID NOT NULL REFERENCES user_profiles(id),
  encrypted_content TEXT NOT NULL,
  status TEXT CHECK (status IN ('submitted', 'under_review', 'resolved', 'escalated')) DEFAULT 'submitted',
  assigned_to UUID REFERENCES user_profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ APPRAISALS ============

CREATE TABLE appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Algorithm Inputs
  learning_hours_score DECIMAL(3,2) DEFAULT 0,
  charter_score DECIMAL(3,2) DEFAULT 0,
  peer_review_score DECIMAL(3,2) DEFAULT 0,
  manager_review_score DECIMAL(3,2) DEFAULT 0,
  task_completion_rate DECIMAL(3,2) DEFAULT 0,
  client_retention_rate DECIMAL(3,2) DEFAULT 0,

  -- Output
  calculated_raise_percentage DECIMAL(5,2) DEFAULT 0,
  final_raise_percentage DECIMAL(5,2),
  approved_by UUID REFERENCES user_profiles(id),
  status TEXT CHECK (status IN ('pending', 'calculated', 'approved', 'rejected')) DEFAULT 'pending',
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ AI QUERY LOGS ============

CREATE TABLE ai_query_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  citations JSONB,
  feedback TEXT CHECK (feedback IN ('helpful', 'not_helpful')),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ LEARNING SUBMISSIONS ============

CREATE TABLE learning_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  academy_content_id UUID REFERENCES pioneer_academy(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  hours_claimed DECIMAL(4,2) NOT NULL,

  -- AI Verification
  ai_verified BOOLEAN DEFAULT FALSE,
  ai_verification_score DECIMAL(3,2),
  ai_flags TEXT[],

  -- Approval
  approved BOOLEAN,
  approved_by UUID REFERENCES user_profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDEXES ============

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_client_id ON tasks(client_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_clients_tier ON clients(tier);
CREATE INDEX idx_clients_payment_status ON clients(payment_status);
CREATE INDEX idx_arcade_events_user ON arcade_events(user_id);
CREATE INDEX idx_social_posts_author ON social_posts(author_id);
CREATE INDEX idx_automation_logs_recipient ON automation_logs(recipient_id);

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pioneer_academy ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posh_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_submissions ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (extend based on your needs)

-- User profiles: Users can read all, update own
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Tasks: Users can view assigned or created tasks
CREATE POLICY "Users can view relevant tasks" ON tasks FOR SELECT USING (
  assigned_to = auth.uid() OR assigned_by = auth.uid()
);

-- Meetings: Users can view if they're attendees
CREATE POLICY "Users can view meetings they attend" ON meetings FOR SELECT USING (
  organizer_id = auth.uid() OR auth.uid() = ANY(attendees)
);

-- Academy: Everyone can read
CREATE POLICY "Everyone can read academy content" ON pioneer_academy FOR SELECT USING (true);

-- Social: Everyone can read posts
CREATE POLICY "Everyone can read posts" ON social_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- POSH: Only complainant and assigned can view
CREATE POLICY "POSH restricted access" ON posh_complaints FOR SELECT USING (
  complainant_id = auth.uid() OR assigned_to = auth.uid()
);

-- ============ FUNCTIONS ============

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pioneer_academy_updated_at BEFORE UPDATE ON pioneer_academy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tool_registry_updated_at BEFORE UPDATE ON tool_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posh_complaints_updated_at BEFORE UPDATE ON posh_complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appraisals_updated_at BEFORE UPDATE ON appraisals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_submissions_updated_at BEFORE UPDATE ON learning_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update XP/HP on arcade events
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET
    xp_points = xp_points + NEW.xp_change,
    hp_points = GREATEST(0, hp_points + NEW.hp_change)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER arcade_event_update_points
AFTER INSERT ON arcade_events
FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Pioneer'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
