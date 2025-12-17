import React, { useEffect, useState } from "react";
import { fetchAllUsers } from "../../utils/UsersUtils";
import UserTable from "@/Admin/components/Tables/UserTable";
import ReactLoading from "react-loading";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsersData = await fetchAllUsers();
        setUsers(allUsersData);
      } catch (error) {
        console.error("Error fetching all users: ", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="text-center text-lg font-semibold text-gray-600">
          <div className="w-screen flex items-center justify-center h-screen -mt-24">
            <ReactLoading type={"bars"} height={30} width={30} color="black" />
          </div>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
};

export default Users;
