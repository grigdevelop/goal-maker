export function RegisterForm() {
    return (
        <>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">Register</legend>

                <label className="label">Email</label>
                <input type="email" className="input" placeholder="email" />

                <label className="label">Password</label>
                <input type="password" className="input" placeholder="password" />

                <label className="label">Confirm Password</label>
                <input type="password" className="input" placeholder="confirm password" />

                <button className="btn btn-primary mt-4">Register</button>
            </fieldset></>
    )
}