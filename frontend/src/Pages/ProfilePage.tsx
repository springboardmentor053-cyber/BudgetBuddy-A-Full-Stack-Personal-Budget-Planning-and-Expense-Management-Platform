import Navbar from "../components/Navbar/Navbar";
import ProfileCard from "../components/Profile/ProfileCard";

function ProfilePage() {

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-8">
    <ProfileCard />
      

      
      <div className="p-10">

        {/* <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Profile
        </h1>

        <ProfileCard /> */}

      </div>

    </div>

  );

}

export default ProfilePage;