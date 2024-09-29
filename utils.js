export const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};
export const getTaskStatusColor = (closestTaskAt) => {
  const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

  const taskDate = new Date(closestTaskAt * 1000);
  const currentDate = new Date();

  taskDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const dayDifference = (taskDate - currentDate) / MS_IN_A_DAY;

  if (dayDifference < 0) return 'red';
  if (dayDifference === 0) return 'green';
  return 'yellow';
};
