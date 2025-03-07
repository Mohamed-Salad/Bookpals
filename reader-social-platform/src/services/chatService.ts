import { supabase } from '../config/supabaseConfig';
import { Message } from '../config/supabaseConfig';

export interface ChatError {
  message: string;
}

export interface ChatResponse {
  messages: Message[];
  error: ChatError | null;
}

export const chatService = {
  /**
   * Send a message to a user or group
   * @param content - Message content
   * @param senderId - ID of the message sender
   * @param receiverId - ID of the message receiver (user or group)
   * @param groupId - Optional group ID for group messages
   * @returns Promise with sent message or error
   */
  async sendMessage(
    content: string,
    senderId: string,
    receiverId: string,
    groupId?: string
  ): Promise<{ message: Message | null; error: ChatError | null }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content,
            sender_id: senderId,
            receiver_id: receiverId,
            group_id: groupId,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        message: data,
        error: null,
      };
    } catch (error) {
      return {
        message: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to send message',
        },
      };
    }
  },

  /**
   * Get message history between two users or in a group
   * @param userId1 - First user's ID
   * @param userId2 - Second user's ID (or group ID)
   * @param groupId - Optional group ID for group chat
   * @param limit - Maximum number of messages to return
   * @returns Promise with messages or error
   */
  async getMessageHistory(
    userId1: string,
    userId2: string,
    groupId?: string,
    limit: number = 50
  ): Promise<ChatResponse> {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
        .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (groupId) {
        query = query.eq('group_id', groupId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        messages: data.reverse(),
        error: null,
      };
    } catch (error) {
      return {
        messages: [],
        error: {
          message: error instanceof Error ? error.message : 'Failed to get message history',
        },
      };
    }
  },

  /**
   * Subscribe to real-time message updates
   * @param userId - Current user's ID
   * @param callback - Function to handle new messages
   * @returns Unsubscribe function
   */
  subscribeToMessages(
    userId: string,
    callback: (message: Message) => void
  ): () => void {
    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  /**
   * Create a new reading group chat
   * @param name - Group name
   * @param description - Group description
   * @param createdBy - ID of the group creator
   * @param genre - Group's reading genre
   * @returns Promise with created group or error
   */
  async createGroup(
    name: string,
    description: string,
    createdBy: string,
    genre: string
  ): Promise<{ group: any; error: ChatError | null }> {
    try {
      const { data, error } = await supabase
        .from('reading_groups')
        .insert([
          {
            name,
            description,
            created_by: createdBy,
            genre,
            members: [createdBy],
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        group: data,
        error: null,
      };
    } catch (error) {
      return {
        group: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create group',
        },
      };
    }
  },

  /**
   * Join a reading group
   * @param groupId - ID of the group to join
   * @param userId - ID of the user joining
   * @returns Promise with success or error
   */
  async joinGroup(
    groupId: string,
    userId: string
  ): Promise<{ success: boolean; error: ChatError | null }> {
    try {
      const { data: group, error: groupError } = await supabase
        .from('reading_groups')
        .select('members')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;

      const members = [...group.members, userId];

      const { error: updateError } = await supabase
        .from('reading_groups')
        .update({ members })
        .eq('id', groupId);

      if (updateError) throw updateError;

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to join group',
        },
      };
    }
  },
}; 