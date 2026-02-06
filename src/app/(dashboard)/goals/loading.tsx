export default function GoalsLoading() {
    return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card card-border w-96">
                    <div className="card-body">
                        <div className="skeleton h-6 w-3/4 mb-2"></div>
                        <div className="skeleton h-4 w-full mb-1"></div>
                        <div className="skeleton h-4 w-2/3"></div>
                        <div className="card-actions justify-end mt-2">
                            <div className="skeleton h-8 w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
