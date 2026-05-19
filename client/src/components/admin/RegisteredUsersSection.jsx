const RegisteredUsersSection = ({ users, onRoleUpdate, onDeleteUser }) => (
    <section className="order-2 mb-8 rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Registered Users ({users.length})</h2>
        <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Mobile</th>
                        <th className="pb-2">Email Verified</th>
                        <th className="pb-2">Role</th>
                        <th className="pb-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user._id} className="border-b last:border-0">
                            <td className="py-3 font-medium">{user.name}</td>
                            <td className="py-3 text-gray-600">{user.email}</td>
                            <td className="py-3 text-gray-600">{user.phone || '-'}</td>
                            <td className="py-3 text-gray-600">{user.isEmailVerified ? 'Yes' : 'No'}</td>
                            <td className="py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-[#eef7e9] text-[#3f6b3f]'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="py-3">
                                {user.email !== 'admin@farmstay.com' && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <select
                                            className="rounded border p-1 text-sm"
                                            defaultValue={user.role}
                                            onChange={(event) => {
                                                if (event.target.value === 'custom') {
                                                    const newRole = window.prompt('Enter new role name:');
                                                    if (newRole) onRoleUpdate(user._id, newRole.toLowerCase());
                                                } else {
                                                    onRoleUpdate(user._id, event.target.value);
                                                }
                                            }}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            {!['user', 'admin'].includes(user.role) && <option value={user.role}>{user.role}</option>}
                                            <option value="custom">+ Add New Role</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteUser(user._id, user.email)}
                                            className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

export default RegisteredUsersSection;
