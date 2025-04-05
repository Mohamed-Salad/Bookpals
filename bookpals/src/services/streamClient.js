import { StreamChat } from "stream-chat";

const client = StreamChat.getInstance("{{ api_key }}");
// you can still use new StreamChat("api_key");

await client.connectUser(
  {
    id: "jlahey",
    name: "Jim Lahey",
    image: "https://i.imgur.com/fR9Jz14.png",
  },
  "{{ chat_user_token }}"
);
