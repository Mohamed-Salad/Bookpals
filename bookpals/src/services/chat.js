import { streamClient } from "../streamClient";

const chatService = {
  connectUser: async (userId, userName, userImage, token) => {
    try {
      await streamClient.connectUser(
        {
          id: userId,
          name: userName,
          image: userImage,
        },
        token
      );
    } catch (error) {
      console.error("Error connecting to chat:", error);
      throw error;
    }
  },

  disconnectUser: async () => {
    try {
      await streamClient.disconnectUser();
    } catch (error) {
      console.error("Error disconnecting from chat:", error);
      throw error;
    }
  },

  createChannel: async (channelType, channelId, members) => {
    try {
      const channel = streamClient.channel(channelType, channelId, {
        members,
      });
      await channel.create();
      return channel;
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  },

  getChannel: async (channelType, channelId) => {
    try {
      const channel = streamClient.channel(channelType, channelId);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error("Error getting channel:", error);
      throw error;
    }
  },
};

export default chatService;
