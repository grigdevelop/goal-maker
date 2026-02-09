import { CreateGoalBtn } from "@/components/goals";
import { CreateSkillBtn } from "@/components/skills";
import { CreateTaskBtn } from "@/components/tasks";

export function WelcomeActions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
            <div className="card bg-base-200 shadow-md">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">Create Goal</h2>
                    <p className="text-sm opacity-70">Set objectives to achieve</p>
                    <div className="mt-4">
                        <CreateGoalBtn className="btn btn-ghost" />
                    </div>
                </div>
            </div>
            <div className="card bg-base-200 shadow-md">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">Develop Skill</h2>
                    <p className="text-sm opacity-70">Track your growth</p>
                    <div className="mt-4">
                        <CreateSkillBtn className="btn btn-ghost" />
                    </div>
                </div>
            </div>
            <div className="card bg-base-200 shadow-md">
                <div className="card-body items-center text-center">
                    <h2 className="card-title">Manage Task</h2>
                    <p className="text-sm opacity-70">Stay organized</p>
                    <div className="mt-4">
                        <CreateTaskBtn className="btn btn-ghost" />
                    </div>
                </div>
            </div>
        </div>
    );
}