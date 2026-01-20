import dayjs from "dayjs";

export const getGreeting = () => {
  const hour = dayjs().hour();

  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};