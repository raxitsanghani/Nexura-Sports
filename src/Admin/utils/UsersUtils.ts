import { getFirestore, collection, getDocs } from "firebase/firestore";

export const fetchAllUsers = async () => {
  const db = getFirestore();
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  const users = [];

  snapshot.forEach((doc) => {
    const userData = doc.data();
    const user = {
      id: doc.id,
      name: userData.name,
      profilePic: userData.profilePic, // Assuming this field exists
      totalOrders: userData.orders?.length || 0, // Total orders count
      email: userData.email, // Assuming this field exists
      // Add other important information here
    };
    users.push(user);
  });

  return users;
};
