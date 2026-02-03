type Goal = {
    id: number;
    title: string;
    description: string | null;
};

type Props = {
    goal: Goal;
};

export const GoalCard = ({ goal }: Props) => {
    return (
        <div className="card card-border w-96">
            <div className="card-body">
                <h2 className="card-title">{goal.title}</h2>
                <p>{goal.description}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Open</button>
                </div>
            </div>
        </div>
    )
};