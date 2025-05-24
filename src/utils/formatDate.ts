export const formatDate = (datetime: string): string => {
  const dateObject = new Date(datetime);

  const day = dateObject.toLocaleDateString("en-US", { day: "numeric" });
  const month = dateObject.toLocaleDateString("en-US", { month: "long" });
  const year = dateObject.toLocaleDateString("en-US", { year: "numeric" });
  const weekday = dateObject.toLocaleDateString("en-US", { weekday: "long" });

  return `${weekday} ${day} ${month} ${year}`;
};

export const formatFormDate = (isoDate: string): string => {
  if (!isoDate) return "";

  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two-digit month
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two-digit day

  return `${year}-${month}-${day}`;
};

export const formatTime = (datetime: string): string => {
  const timeObject = new Date(datetime);
  const hours = timeObject.getHours();
  const minutes = timeObject.getMinutes().toString().padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${hours}:${minutes} ${suffix}`;
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};
