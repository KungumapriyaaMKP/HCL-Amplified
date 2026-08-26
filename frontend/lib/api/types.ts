/**
 * This file was auto-generated from openapi.json.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/api/plan": {
        post: operations["create_plan_api_plan_post"];
    };
    "/api/plan/relax": {
        post: operations["relax_plan_api_plan_relax_post"];
    };
    "/api/roles": {
        get: operations["get_roles_api_roles_get"];
    };
    "/api/adapt/detour": {
        post: operations["insert_plan_detour_api_adapt_detour_post"];
    };
    "/api/me": {
        get: operations["get_me_api_me_get"];
    };
    "/api/profile": {
        post: operations["update_profile_api_profile_post"];
    };
    "/api/events": {
        post: operations["record_event_api_events_post"];
    };
    "/api/history": {
        get: operations["get_history_api_history_get"];
    };
    "/api/profile/resume": {
        post: operations["upload_resume_api_profile_resume_post"];
    };
    "/api/profile/github": {
        post: operations["profile_github_user_api_profile_github_post"];
    };
    "/api/diagnostic/generate": {
        post: operations["generate_diagnostic_api_diagnostic_generate_post"];
    };
    "/api/diagnostic/submit": {
        post: operations["submit_diagnostic_api_diagnostic_submit_post"];
    };
    "/api/socratic": {
        post: operations["get_socratic_guidance_api_socratic_post"];
    };
    "/api/chat": {
        post: operations["chat_intake_stream_api_chat_post"];
    };
    "/api/gamification": {
        get: operations["get_gamification_stats_api_gamification_get"];
    };
    "/api/poincare": {
        get: operations["get_poincare_disk_layout_api_poincare_get"];
    };
    "/api/health": {
        get: operations["health_api_health_get"];
    };
}

export type webhooks = Record<string, never>;

export interface components {
    schemas: {
        /** Badge */
        Badge: {
            id: string;
            title: string;
            description: string;
            icon: string;
            unlocked: boolean;
            unlocked_at?: string | null;
        };
        /** Body_upload_resume_api_profile_resume_post */
        Body_upload_resume_api_profile_resume_post: {
            file: string;
        };
        /** ChatMessage */
        ChatMessage: {
            role: string;
            content: string;
        };
        /** ChatRequest */
        ChatRequest: {
            messages: components["schemas"]["ChatMessage"][];
        };
        /** Confidence */
        Confidence: "high" | "medium" | "low";
        /** DetourRequest */
        DetourRequest: {
            blocked_skill_id: string;
            goal?: string;
        };
        /** DetourResponse */
        DetourResponse: {
            success: boolean;
            blocked_skill_id: string;
            bridge_skill_id?: string | null;
            bridge_skill_name?: string | null;
            rationale?: string | null;
            plan?: components["schemas"]["PlanResponse"] | null;
        };
        /** DiagnosticAnswerItem */
        DiagnosticAnswerItem: {
            skill_id: string;
            discrimination?: number;
            difficulty?: number;
            is_correct: boolean;
        };
        /** DiagnosticGenerateRequest */
        DiagnosticGenerateRequest: {
            goal?: string;
            num_questions?: number;
        };
        /** DiagnosticGenerateResponse */
        DiagnosticGenerateResponse: {
            questions: components["schemas"]["DiagnosticQuestion"][];
            skills_tested: string[];
        };
        /** DiagnosticQuestion */
        DiagnosticQuestion: {
            id: string;
            skill_id: string;
            skill_name: string;
            question: string;
            options: string[];
            correct_index: number;
            explanation: string;
            discrimination?: number;
            difficulty?: number;
        };
        /** DiagnosticSubmitRequest */
        DiagnosticSubmitRequest: {
            responses: components["schemas"]["DiagnosticAnswerItem"][];
            goal?: string;
        };
        /** DiagnosticSubmitResponse */
        DiagnosticSubmitResponse: {
            theta: number;
            standard_error: number;
            updated_mastery: { [key: string]: number };
            readiness_pct: number;
        };
        /** EventIn */
        EventIn: {
            type: components["schemas"]["EventType"];
            skill_id?: string | null;
            resource_id?: string | null;
            score?: number | null;
            minutes_spent?: number | null;
            payload?: Record<string, any>;
            at?: string | null;
        };
        /** EventType */
        EventType: "resource_started" | "resource_completed" | "quiz_attempted" | "review_completed" | "feedback_given" | "path_generated" | "detour_inserted";
        /** GamificationResponse */
        GamificationResponse: {
            total_xp: number;
            level: number;
            next_level_xp: number;
            current_level_progress_pct: number;
            streak_days: number;
            total_events: number;
            badges: components["schemas"]["Badge"][];
        };
        /** GitHubProfileRequest */
        GitHubProfileRequest: {
            username: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HistoryResponse */
        HistoryResponse: {
            saved_plans: Record<string, any>[];
            retention_summary: Record<string, any>[];
            activity_grid: Record<string, any>[];
        };
        /** Mastery */
        Mastery: {
            skill_id: string;
            level: number;
            confidence?: components["schemas"]["Confidence"];
            evidence?: components["schemas"]["MasteryEvidence"][];
        };
        /** MasteryEvidence */
        MasteryEvidence: {
            source: string;
            quote?: string | null;
            detail?: string | null;
        };
        /** MilestoneOut */
        MilestoneOut: {
            phase: components["schemas"]["Phase"];
            title: string;
            total_hours: number;
            nodes: components["schemas"]["NodeOut"][];
        };
        /** Modality */
        Modality: "video" | "lab" | "reading" | "project" | "assessment";
        /** NodeOut */
        NodeOut: {
            skill_id: string;
            skill_name: string;
            status: components["schemas"]["NodeStatus"];
            phase: components["schemas"]["Phase"];
            order: number;
            estimated_hours: number;
            duration_display?: string;
            xp: number;
            gap_delta: number;
            resource: components["schemas"]["ResourceOut"] | null;
            alternatives?: components["schemas"]["ResourceOut"][];
            rationale: string | null;
            is_remediation: boolean;
        };
        /** NodeStatus */
        NodeStatus: "mastered" | "active" | "next" | "locked";
        /** Phase */
        Phase: "foundations" | "core" | "advanced" | "capstone";
        /** PlanRelaxRequest */
        PlanRelaxRequest: {
            goal: string;
            hours_per_week?: number;
            deadline_weeks?: number | null;
            budget_usd?: number | null;
            known?: { [key: string]: number };
            priority?: string;
        };
        /** PlanRelaxResponse */
        PlanRelaxResponse: {
            is_feasible: boolean;
            baseline_hours: number;
            baseline_weeks: number | null;
            deadline_weeks: number | null;
            hours_per_week: number;
            options: components["schemas"]["RelaxationOption"][];
        };
        /** PlanRequest */
        PlanRequest: {
            goal: string;
            hours_per_week?: number;
            deadline_weeks?: number | null;
            budget_usd?: number | null;
            preferred_modalities?: components["schemas"]["Modality"][];
            known?: { [key: string]: number };
            priority?: string;
        };
        /** PlanResponse */
        PlanResponse: {
            goal: string;
            target_role: string;
            readiness_pct: number;
            total_hours: number;
            total_cost_usd: number;
            weeks_required: number | null;
            is_feasible: boolean;
            prerequisite_violations: number;
            milestones: components["schemas"]["MilestoneOut"][];
            gap_count: number;
        };
        /** PoincareEdge */
        PoincareEdge: {
            source: string;
            target: string;
            hyperbolic_dist: number;
        };
        /** PoincareNode */
        PoincareNode: {
            id: string;
            name: string;
            topic: string;
            depth: number;
            fan_out: number;
            u: number;
            v: number;
            radius: number;
            angle: number;
        };
        /** PoincareResponse */
        PoincareResponse: {
            nodes: components["schemas"]["PoincareNode"][];
            edges: components["schemas"]["PoincareEdge"][];
        };
        /** ProfileIntakeResponse */
        ProfileIntakeResponse: {
            skills: components["schemas"]["Mastery"][];
            count: number;
        };
        /** ProfileResponse */
        ProfileResponse: {
            user_id: string;
            display_name: string;
            is_guest: boolean;
        };
        /** ProfileUpdateRequest */
        ProfileUpdateRequest: {
            display_name: string;
        };
        /** RelaxationOption */
        RelaxationOption: {
            type: string;
            title: string;
            description: string;
            hours_saved: number;
            new_total_hours: number;
            new_weeks_required: number;
            is_feasible: boolean;
        };
        /** ResourceOut */
        ResourceOut: {
            id: string;
            provider: string;
            title: string;
            url: string;
            duration_display: string;
            difficulty: string | null;
            price_usd: number;
            price_is_estimate: boolean;
            cost_type: string;
        };
        /** RoleItem */
        RoleItem: {
            id: string;
            name: string;
            summary: string;
            demand_score: number;
            demand_label: string;
            demand_snapshot_date: string;
            skills_count: number;
            skill_ids?: string[];
        };
        /** RolesResponse */
        RolesResponse: {
            roles: components["schemas"]["RoleItem"][];
        };
        /** SocraticRequest */
        SocraticRequest: {
            skill_id: string;
            skill_name: string;
            chosen_answer: string;
            question: string;
            correct_answer?: string;
        };
        /** SocraticResponse */
        SocraticResponse: {
            scaffolding_questions: string[];
            conceptual_hint: string;
            diagram: string;
        };
        /** UserMeResponse */
        UserMeResponse: {
            user_id: string;
            display_name: string;
            is_guest: boolean;
        };
        /** ValidationError */
        ValidationError: {
            loc: string | number[];
            msg: string;
            type: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}

export type $defs = Record<string, never>;

export interface operations {
    "create_plan_api_plan_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "relax_plan_api_plan_relax_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_roles_api_roles_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "insert_plan_detour_api_adapt_detour_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_me_api_me_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "update_profile_api_profile_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "record_event_api_events_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_history_api_history_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "upload_resume_api_profile_resume_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "profile_github_user_api_profile_github_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "generate_diagnostic_api_diagnostic_generate_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "submit_diagnostic_api_diagnostic_submit_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_socratic_guidance_api_socratic_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "chat_intake_stream_api_chat_post": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_gamification_stats_api_gamification_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "get_poincare_disk_layout_api_poincare_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
    "health_api_health_get": {
        parameters: Record<string, any>;
        responses: Record<string, any>;
    };
}

export interface RoleCompareRequest {
    current_role_id: string;
    target_role_id: string;
    hours_per_week?: number;
}

export interface RoleCompareResponse {
    current_role: string;
    target_role: string;
    shared_skill_count: number;
    delta_skill_count: number;
    delta_hours: number;
    delta_weeks: number | null;
    transferability_pct: number;
    shared_skill_names: string[];
    delta_skill_names: string[];
}

