import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart } from 'lucide-react';
import categories from '../../data/categories.json';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../data/translations';

const LivePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const { language } = useLanguage();

  // Store recent name usages with timestamps
  const recentNamesRef = useRef([]);

  const userNames = [
    "Sonu", "Aman Singh", "Priya", "Rahul Verma", "Neha", "Vikram Singh",
    "Anjali", "Rajesh Kumar", "Pooja", "Deepak Yadav", "Kavita", "Mohan Lal",
    "Sunita", "Ramesh Kumar", "Sita", "Ajay Singh", "Reena", "Suresh Kumar",
    "Meena", "Lakhan", "Arjun Mehta", "Simran", "Vivek", "Tanya Mishra",
    "Gaurav", "Isha Rani", "Aakash", "Payal", "Manoj Pandey", "Chandan",
    "Alok Sharma", "Ritu", "Devendra Singh", "Poonam", "Shivam", "Monika",
    "Harsh", "Sonal", "Kiran", "Anupama", "Rohit", "Sandeep", "Varun", "Dipti",
    "Shreya", "Abhishek", "Priyanka", "Mayank", "Tanvi", "Kartik", "Komal",
    "Sameer", "Sneha", "Amit", "Preeti", "Naveen", "Swati", "Manish", "Rachna",
    "Vikas", "Nidhi", "Ashish", "Bhavna", "Pankaj", "Shalini", "Yogesh", "Anita",
    "Hemant", "Rupesh", "Seema", "Rajiv", "Neetu", "Suraj", "Anuradha", "Ravi",
    "Kirti", "Jitendra", "Nisha", "Balram", "Aarti", "Shankar", "Pallavi",
    "Rajkumar", "Manju", "Prakash", "Usha", "Chirag", "Lata", "Vinay", "Alka",
    "Sudhir", "Sarita", "Dinesh", "Kusum", "Parveen", "Madhuri", "Harish",
    "Babita", "Mahesh", "Sunil",
    "Devil King", "Nobita", "Goku", "Shadow", "Dark Rider", "Ghost King", "Ninja Boy",
    "Dragon Master", "Firestorm", "Black Panther", "Iron Fist", "Thunder Lord",
    "Wolf King", "Phantom", "Snake Eyes", "Night Stalker", "Storm Bringer", "Blade",
    "Cyber Ninja", "Doom Slayer", "Pixel Warrior", "Rogue Assassin", "Shadow Ninja",
    "Ice Dragon", "Flame King", "Atomic Beast", "Steel Titan", "Dead Shot", "Blood Fang",
    "Dark Phoenix", "Death Bringer", "Skull Crusher", "Hell Rider", "Galaxy Knight",
    "Soul Hunter", "Venom King", "Shadow Lord", "Dragon Slayer", "Ice Phantom",
    "Fire Ninja", "Blade King", "Cyber Wolf", "Storm King", "Night Phantom",
    "Blood Knight", "Hellstorm", "Ghost Ninja", "Demon King", "Dark Rider X",
    "Omega Beast", "Shadow Flame"
  ];

  const getAllServices = () => {
    const allServices = [];
    categories.forEach(category => {
      category.packs.forEach(pack => {
        if (pack.filter === "Comments") return;
        let weight = 1;
        if (category.name === "Instagram") {
          if (pack.filter === "Followers") {
            if (pack.title.includes("1000")) weight = 25;
            else if (pack.title.includes("5000")) weight = 15;
            else weight = 8;
          } else {
            weight = 5;
          }
        } else if (category.name === "YouTube") {
          weight = pack.title.includes("1000") ? 6 : 4;
        } else {
          weight = 2;
        }
        allServices.push({ name: category.name, packTitle: pack.title, weight });
      });
    });
    return allServices;
  };

  const getRandomService = () => {
    const services = getAllServices();
    const totalWeight = services.reduce((sum, s) => sum + s.weight, 0);
    const random = Math.random() * totalWeight;
    let cumulative = 0;
    for (const s of services) {
      cumulative += s.weight;
      if (random <= cumulative) return s;
    }
    return services[0];
  };

  const getRandomUserName = () => {
    const now = Date.now();
    // Remove names older than 10 seconds
    recentNamesRef.current = recentNamesRef.current.filter(
      entry => now - entry.time < 10000
    );
    const availableNames = userNames.filter(
      name => !recentNamesRef.current.some(entry => entry.name === name)
    );
    // If no names left, reset
    const chosenName =
      availableNames.length > 0
        ? availableNames[Math.floor(Math.random() * availableNames.length)]
        : userNames[Math.floor(Math.random() * userNames.length)];
    recentNamesRef.current.push({ name: chosenName, time: now });
    return chosenName;
  };

  const generatePurchase = () => {
    const userName = getRandomUserName();
    const service = getRandomService();
    const maskName = (name) => {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        const firstName = parts[0];
        const lastName = parts[1];
        
        // First name: show first 2 letters + last 1 letter if length > 3
        const firstNameMasked = firstName.length > 3 
          ? `${firstName.substring(0, 2)}***${firstName.substring(firstName.length - 1)}`
          : `${firstName.substring(0, 2)}***`;
        
        // Last name: show first 2 letters + last 1 letter if length > 3
        const lastNameMasked = lastName.length > 3 
          ? `${lastName.substring(0, 2)}***${lastName.substring(lastName.length - 1)}`
          : `${lastName.substring(0, 2)}***`;
        
        return `${firstNameMasked} ${lastNameMasked}`;
      } else {
        // Single name: show first 2 letters + last 1 letter if length > 3
        return name.length > 3 
          ? `${name.substring(0, 2)}***${name.substring(name.length - 1)}`
          : `${name.substring(0, 2)}***`;
      }
    };
    return {
      id: Date.now() + Math.random(),
      userName: maskName(userName),
      service: service.name,
      packTitle: service.packTitle,
      time: "just now"
    };
  };

  useEffect(() => {
    setPurchases(Array.from({ length: 4 }, () => generatePurchase()));
    const addPurchaseTimer = setInterval(() => {
      const count = Math.floor(Math.random() * 2) + 1; // Reduced from 0-4 to 1-2
      if (count > 0) {
        setPurchases(prev => {
          const newPurchases = Array.from({ length: count }, () => generatePurchase());
          return [...newPurchases, ...prev].slice(0, 5);
        });
      }
    }, 3000); // Increased from 1000ms to 3000ms (3 seconds)
    return () => clearInterval(addPurchaseTimer);
  }, []);

  return (
    <div className="mx-4 mt-4 mb-6 p-4 bg-green-50 rounded-xl ">
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-semibold text-gray-700">{getTranslation('liveCustomersBuying', language)}</span>
      </div>
      <div className="h-32 overflow-hidden">
        <div className="space-y-1">
          {purchases.map(p => (
            <div key={p.id} className="text-sm text-gray-700 py-1 truncate">
              <span className="font-medium text-gray-800">{p.userName}</span>{" "}
              purchased {p.packTitle} just now
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LivePurchases;
