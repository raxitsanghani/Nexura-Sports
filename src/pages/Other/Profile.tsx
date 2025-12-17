import React, { useEffect, useState, ChangeEvent } from "react";
import { CgLogOut } from "react-icons/cg";
import { toast } from "@/components/ui/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/Database/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { PlusIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/components/ui/cropImage";

const Profile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [image, setImage] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [cropperOpen, setCropperOpen] = useState<boolean>(false);
  const [cropperSize] = useState<{ width: number; height: number }>({
    width: window.innerWidth < 768 ? 180 : 300,
    height: window.innerWidth < 768 ? 180 : 300,
  });
  const [editMode, setEditMode] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState<{
    name: string;
    city: string;
    state: string;
    zipcode: string;
    mobile: string;
  }>({
    name: "",
    city: "",
    state: "",
    zipcode: "",
    mobile: "",
  });
  const [newCard, setNewCard] = useState<{
    number: string;
    name: string;
    expiry: string;
  }>({
    number: "",
    name: "",
    expiry: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfilePicUrl(user.photoURL || "");
      setDisplayName(user.displayName || "");
      // @ts-ignore
      setBio(user?.bio || "");

      const fetchProfileData = async () => {
        try {
          const db = getFirestore();
          const userRef = doc(db, `users/${user.uid}`);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profilePic) {
              setProfilePicUrl(data.profilePic);
            }
            if (data.addresses) {
              setAddresses(data.addresses);
            }
            if (data.cards) {
              setCards(data.cards);
            }
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      };

      fetchProfileData();
    }
  }, [user]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(URL.createObjectURL(file));
      setCroppedImage(null);
      setCropperOpen(true);
    }
  };

  const handleCropComplete = async (
    // @ts-ignore
    croppedArea: any,
    croppedAreaPixels: any
  ): Promise<void> => {
    try {
      const croppedImg = await getCroppedImg(image!, croppedAreaPixels);
      setCroppedImage(croppedImg);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!croppedImage || !user) return;

    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile-pics/${user.uid}/${Date.now()}.jpg`
      );

      const response = await fetch(croppedImage);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicUrl(downloadURL);

      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, { profilePic: downloadURL });

      toast({ title: "Profile picture updated!" });
      setCropperOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Failed to upload profile picture",
      });
    }
  };

  const handleSaveProfile = async (): Promise<void> => {
    if (!user) return;
    try {
      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, {
        displayName,
        bio,
        addresses,
        cards,
      });
      toast({ title: "Profile updated!" });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
      });
    }
  };

  const handleAddAddress = async (): Promise<void> => {
    if (
      !user ||
      !newAddress.name ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.zipcode ||
      !newAddress.mobile
    )
      return;
    try {
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);

      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, { addresses: updatedAddresses });

      setNewAddress({
        name: "",
        city: "",
        state: "",
        zipcode: "",
        mobile: "",
      });
      toast({ title: "Address added!" });
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        variant: "destructive",
        title: "Failed to add address",
      });
    }
  };

  const handleAddCard = async (): Promise<void> => {
    if (!user || !newCard.number || !newCard.name || !newCard.expiry) return;
    try {
      const updatedCards = [...cards, newCard];
      setCards(updatedCards);

      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, { cards: updatedCards });

      setNewCard({
        number: "",
        name: "",
        expiry: "",
      });
      toast({ title: "Card added!" });
    } catch (error) {
      console.error("Error adding card:", error);
      toast({
        variant: "destructive",
        title: "Failed to add card",
      });
    }
  };

  const handleDeleteAddress = async (index: number): Promise<void> => {
    if (!user) return;
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      setAddresses(updatedAddresses);

      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, { addresses: updatedAddresses });

      toast({ title: "Address deleted!" });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete address",
      });
    }
  };

  const handleDeleteCard = async (index: number): Promise<void> => {
    if (!user) return;
    try {
      const updatedCards = cards.filter((_, i) => i !== index);
      setCards(updatedCards);

      const db = getFirestore();
      const userRef = doc(db, `users/${user.uid}`);
      await updateDoc(userRef, { cards: updatedCards });

      toast({ title: "Card deleted!" });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete card",
      });
    }
  };

  const logoutFnc = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast({ title: "Logged out successfully!" });
      navigate("/login");
    } catch (error) {
      toast({ variant: "destructive", title: (error as Error).message });
    }
  };

  return (
    <div className="container mx-auto mt-10 p-5 bg-gray-50 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4 mb-8">
        <div className="relative w-32 h-32">
          <img
            src={profilePicUrl || "https://via.placeholder.com/150"}
            alt="Profile Picture"
            className="w-full h-full object-cover rounded-full border-4 border-blue-500"
          />
          <label
            htmlFor="file-input"
            className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer"
          >
            <PlusIcon size="24" className="text-white" />
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="flex flex-col justify-center">
          {editMode ? (
            <>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-xl font-semibold mb-2 border-b border-gray-300 focus:outline-none"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="textarea mb-2 border border-gray-300 rounded p-2 w-full"
                placeholder="Add a short bio"
              />
              <button
                onClick={handleSaveProfile}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-gray-600">{bio}</p>
              <button
                onClick={() => setEditMode(true)}
                className="text-blue-500 mt-2"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Addresses</h3>
        {addresses.map((address, index) => (
          <div key={index} className="p-4 border border-gray-300 rounded mb-2">
            <p>{address.name}</p>
            <p>
              {address.city}, {address.state} {address.zipcode}
            </p>
            <p>{address.mobile}</p>
            <button
              onClick={() => handleDeleteAddress(index)}
              className="text-red-500 mt-2"
            >
              Delete Address
            </button>
          </div>
        ))}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Add New Address</h3>
          <input
            type="text"
            placeholder="Name"
            value={newAddress.name}
            onChange={(e) =>
              setNewAddress({ ...newAddress, name: e.target.value })
            }
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="City"
            value={newAddress.city}
            onChange={(e) =>
              setNewAddress({ ...newAddress, city: e.target.value })
            }
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="State"
            value={newAddress.state}
            onChange={(e) =>
              setNewAddress({ ...newAddress, state: e.target.value })
            }
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Zipcode"
            value={newAddress.zipcode}
            onChange={(e) =>
              setNewAddress({ ...newAddress, zipcode: e.target.value })
            }
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Mobile"
            value={newAddress.mobile}
            onChange={(e) =>
              setNewAddress({ ...newAddress, mobile: e.target.value })
            }
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <button
            onClick={handleAddAddress}
            className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          >
            Add Address
          </button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Cards</h3>
        {cards.map((card, index) => (
          <div
            key={index}
            className="p-4 border border-gray-300 rounded mb-2 bg-gray-100"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-700">{card.name}</div>
              <button
                onClick={() => handleDeleteCard(index)}
                className="text-red-500"
              >
                Delete Card
              </button>
            </div>
            <div className="text-sm text-gray-700">{card.number}</div>
            <div className="text-sm text-gray-700">Expires: {card.expiry}</div>
          </div>
        ))}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Add New Card</h3>
          <input
            type="text"
            placeholder="Card Number"
            value={newCard.number}
            onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Cardholder Name"
            value={newCard.name}
            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            placeholder="Expiry Date (MM/YY)"
            value={newCard.expiry}
            onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
            className="border border-gray-300 rounded p-2 w-full mb-2"
          />
          <button
            onClick={handleAddCard}
            className="bg-green-500 text-white py-2 px-4 rounded mt-2"
          >
            Add Card
          </button>
        </div>
      </div>

      <button
        onClick={logoutFnc}
        className="bg-red-500 text-white py-2 px-4 rounded"
      >
        <CgLogOut className="inline mr-2" /> Logout
      </button>

      {cropperOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div
            className="relative bg-white p-4 rounded-lg"
            style={{
              width: cropperSize.width + 30,
              height: cropperSize.height + 80,
            }}
          >
            <div
              style={{ width: cropperSize.width, height: cropperSize.height }}
            >
              {image && (
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex gap-2 p-4">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md w-full"
                onClick={() => setCropperOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md w-full"
                onClick={handleUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
