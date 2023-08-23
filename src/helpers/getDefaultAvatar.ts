import axios from 'axios';

export const getDefaultAvatar = async (name) => {
  const data = await axios.get(
    `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff&size=128&font-size=0.33&rounded=true&bold=true`,
  );

  return data.config.url;
};
