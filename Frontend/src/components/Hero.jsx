import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./LoginContext";



function Hero() {
  const navigate = useNavigate();
  const { loggedIn, user } = useLogin();

  const handleGetStarted = () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }
    // Route based on user role
    if (user?.role === "collector") {
      navigate("/waste-collector-dashboard");
    } else if (user?.role === "organization") {
      navigate("/organization-dashboard");
    } else if (user?.role === "recycle-company") {
      navigate("/recycle-company-dashboard");
    } else {
      // Default to user dashboard
      navigate("/individual-dashboard");
    }
  };

  return (
    <section className="min-h-[80vh] bg-gradient-to-r from-green-500 to-blue-500 text-white flex-col flex items-center justify-center relative mt-20 p-5">
      <div className="absolute inset-0"></div>
      <div className="container mx-auto text-center relative z-10 px-6">
        <h1 className="text-6xl font-extrabold leading-tight">
          Welcome to ScrapSathi
        </h1>
        <p className="text-2xl mt-4 max-w-3xl mx-auto">
          Your trusted partner in waste management, recycling, and
          sustainability for a cleaner, greener planet.
        </p>
        <button onClick={handleGetStarted} className="bg-gradient-to-r drop-shadow-lg shadow-[5px_0px_10px_rgba(0,0,0,0.2)] from-emerald-500  text-white py-3 px-8 mt-8 rounded-full text-xl hover:bg-green-800 transition duration-300 ">
          Get Started
        </button>
      </div>
    </section>
  );
}

export default Hero;
// import React from "react";

// function Hero() {
//   return (
//     <section className="bg-blue-600 text-white py-20 mt-16 min-h-screen flex flex-col items-center justify-center">
//       {/* min-h-screen makes sure the Hero section takes at least the full height of the screen */}
//       <div className="container mx-auto px-6 sm:px-12 flex flex-col items-center justify-center space-y-6">
//         <h1 className="text-5xl font-bold text-center mb-6">
//           Welcome to ScrapSathi
//         </h1>
//         <p className="text-lg text-center">
//           Join us in building a cleaner, greener world by recycling and reducing waste.
//         </p>
//         <div className="flex justify-center mt-6">
//           <a
//             href="#features"
//             className="bg-green-500 text-white py-3 px-6 rounded-full hover:bg-green-600 transition duration-300"
//           >
//             Start Now
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default Hero;
