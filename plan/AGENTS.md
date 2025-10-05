# Plan Directory - Agent Instructions

## Overview
This directory contains the complete implementation plan for the Neighborhood Deal Finder project, organized by phases with detailed tasks and subtasks.

## Directory Structure

```
plan/
├── README.md                     # Plan overview and navigation
├── PROJECT-OVERVIEW.md           # Complete technical architecture
├── QUICK-START.md                # Day-by-day implementation guide
├── phase-1-foundation/           # Week 1: Setup and schema
├── phase-2-backend/              # Week 2-3: Backend infrastructure
├── phase-3-buyer-portal/         # Week 4-5: Buyer experience
├── phase-4-seller-portal/        # Week 6: Seller dashboard
├── phase-5-agent-center/         # Week 7: Agent tools
├── phase-6-ag-ui/                # Week 8: AG-UI integration
├── phase-7-testing/              # Week 9-10: Testing and optimization
└── phase-8-deployment/           # Week 11: Production launch
```

## How to Use This Plan

### Start Here
1. **Read `README.md`** - Overview of entire plan
2. **Read `PROJECT-OVERVIEW.md`** - Technical architecture and stack
3. **Read `QUICK-START.md`** - Day-by-day timeline

### Follow Task Order
1. Navigate to phase folder (e.g., `phase-1-foundation/`)
2. Open first task file (e.g., `task-1.1-environment-setup.md`)
3. Read overview and subtasks
4. Check off subtasks as you complete them
5. Verify acceptance criteria
6. Move to next task

### Task File Structure
Each task file contains:
- **Overview** - What you'll build
- **Estimated Time** - How long it should take
- **Priority** - Critical, High, or Medium
- **Dependencies** - What must be done first
- **Subtasks** - Detailed steps with code examples
- **Acceptance Criteria** - How to know you're done
- **Testing Checklist** - What to verify
- **Next Steps** - Where to go next

## Phase Breakdown

### Phase 1: Foundation & Setup (Week 1)
**Files:**
- `task-1.1-environment-setup.md` - OpenRouter, dependencies, env vars
- `task-1.2-database-schema.md` - Complete Convex schema

**Goal:** Development environment ready with database configured.

### Phase 2: Backend Infrastructure (Week 2-3)
**Files:**
- `task-2.1-convex-functions.md` - All CRUD operations
- `task-2.2-openrouter-service.md` - AI service layer
- `task-2.3-external-apis.md` - MLS, Mapbox, enrichment

**Goal:** Complete backend with AI integration and external APIs.

### Phase 3: Buyer Portal (Week 4-5)
**Files:**
- `task-3.1-buyer-routes.md` - Session-based routing
- `task-3.2-buyer-components.md` - Property cards, galleries, filters
- `task-3.3-ai-chat-widget.md` - Streaming AI chat

**Goal:** Functional buyer experience with AI assistance.

### Phase 4: Seller Portal (Week 6)
**Files:**
- `task-4.1-seller-dashboard.md` - Real-time analytics
- `task-4.2-offer-management.md` - Offer review with AI analysis

**Goal:** Complete seller dashboard with offer management.

### Phase 5: Agent Control Center (Week 7)
**Files:**
- `task-5.1-agent-dashboard.md` - Multi-session management

**Goal:** Agent tools for managing buyers, sellers, and listings.

### Phase 6: AG-UI Integration (Week 8)
**Files:**
- `task-6.1-ag-ui-integration.md` - Event streaming, tool approval

**Goal:** Transparent AI interactions with full visibility.

### Phase 7: Testing & Polish (Week 9-10)
**Files:**
- `task-7.1-testing-strategy.md` - Unit, integration, E2E tests
- `task-7.2-optimization.md` - Performance tuning

**Goal:** Production-ready application with comprehensive testing.

### Phase 8: Deployment (Week 11)
**Files:**
- `task-8.1-production-setup.md` - Security, monitoring
- `task-8.2-launch.md` - Deployment and verification

**Goal:** Successful production launch.

## Working with Tasks

### Starting a Task
1. Read entire task file first
2. Note dependencies and prerequisites
3. Set up any required tools or services
4. Create branch if using git: `git checkout -b task-X.X`

### During Implementation
1. Follow subtasks in order
2. Check off each subtask when complete
3. Test incrementally
4. Commit frequently with clear messages
5. Reference task numbers in commits

### Completing a Task
1. Review acceptance criteria
2. Run testing checklist
3. Test edge cases
4. Document any deviations or issues
5. Mark task as complete
6. Move to next task

## Task Dependencies

### Critical Path
Must be completed in order:
1. Phase 1 → Phase 2 → Phase 3
2. Phase 2.2 (OpenRouter) required for Phase 3.3 (AI Chat)
3. Phase 2.1 (Convex) required for all frontend phases

### Parallelizable Tasks
Can be done simultaneously:
- Phase 3 (Buyer) + Phase 4 (Seller)
- Component development within phases
- Testing alongside development

## Estimation Guidelines

### Time Estimates
- **2-3 hours** - Simple setup or configuration
- **4-6 hours** - Medium complexity features
- **6-8 hours** - Complex features with multiple components
- **8-10 hours** - Large features or integrations
- **10-12 hours** - Complex integrations (AG-UI)

### Adjust for:
- Your experience level
- Familiarity with stack
- Debugging time
- Testing thoroughness

## MVP vs Full Build

### Minimum Viable (6 weeks)
Focus on:
- Phase 1 (Foundation)
- Phase 2 (Backend)
- Phase 3 (Buyer Portal)
- Basic AG-UI (streaming only)
- Essential testing
- Simple deployment

Skip or simplify:
- Seller portal
- Agent dashboard
- Full AG-UI features
- Comprehensive testing

### Full Featured (11 weeks)
Complete all 8 phases with:
- All features
- Full AG-UI integration
- Comprehensive testing
- Production-ready deployment

## Progress Tracking

### Use Checkboxes
Each subtask has a checkbox `- [ ]`:
- Uncheck: `- [ ]` Task pending
- Check: `- [x]` Task complete

### Track in Git
```bash
# Create task branch
git checkout -b task-1.1

# Commit progress
git commit -m "task-1.1: Complete subtask 1.1.3"

# Mark complete
git commit -m "task-1.1: Complete ✓"
```

### Document Issues
If you encounter problems:
1. Document in task file
2. Create GitHub issue (if using)
3. Note workarounds or solutions
4. Update troubleshooting section

## Best Practices

### Before Starting
- Read entire task file
- Understand dependencies
- Gather required resources
- Set up development environment

### During Development
- Follow subtasks sequentially
- Test incrementally
- Commit frequently
- Document decisions
- Ask for help when stuck

### After Completion
- Verify acceptance criteria
- Run full testing checklist
- Update documentation
- Clean up code
- Prepare for next task

## Common Patterns

### Task File Reading
1. **Skim overview** - Get big picture
2. **Check dependencies** - Ensure prerequisites met
3. **Read subtasks** - Understand detailed steps
4. **Review code examples** - See implementation patterns
5. **Note acceptance criteria** - Know when you're done

### Code Implementation
1. **Read code examples in task file**
2. **Adapt to your specific needs**
3. **Test as you build**
4. **Follow style guidelines**
5. **Add comments for complex logic**

### Testing
1. **Test each subtask**
2. **Run integration tests after task**
3. **Check edge cases**
4. **Verify error handling**
5. **Test on different browsers/devices**

## Troubleshooting

### Task Seems Unclear
- Re-read task overview
- Check code examples
- Review referenced files
- Consult main documentation
- Ask for clarification

### Stuck on Subtask
- Review previous subtasks
- Check for missing dependencies
- Read error messages carefully
- Test with simplified example
- Break down into smaller steps

### Time Estimate Off
- Don't rush - quality over speed
- Document time spent
- Adjust future estimates
- Take breaks when needed

## Resources

### Internal Documentation
- `/README.md` - Main project readme
- `/AGENTS.md` - Root agent instructions
- `convex/AGENTS.md` - Backend guidelines
- `app/AGENTS.md` - Frontend guidelines
- `components/AGENTS.md` - Component patterns
- `lib/AGENTS.md` - Utility guidelines

### External Documentation
- Next.js: https://nextjs.org/docs
- Convex: https://docs.convex.dev
- OpenRouter: https://openrouter.ai/docs
- Clerk: https://clerk.com/docs
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

## Support

### Getting Help
1. Check task troubleshooting section
2. Review related AGENTS.md files
3. Consult external documentation
4. Search for similar issues online
5. Ask in relevant communities

### Providing Feedback
Document:
- Unclear instructions
- Missing steps
- Incorrect estimates
- Helpful tips discovered
- Better approaches found

## Completion Checklist

### Task Complete When:
- [ ] All subtasks checked off
- [ ] Acceptance criteria met
- [ ] Testing checklist completed
- [ ] Code committed
- [ ] Documentation updated
- [ ] Ready for next task

### Phase Complete When:
- [ ] All tasks in phase done
- [ ] Integration tests pass
- [ ] Phase goals achieved
- [ ] Ready for next phase

### Project Complete When:
- [ ] All 8 phases done
- [ ] All features working
- [ ] Tests passing
- [ ] Deployed to production
- [ ] Documentation complete
- [ ] Celebrate! 🎉
