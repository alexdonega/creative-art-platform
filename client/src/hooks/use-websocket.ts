import { useEffect, useRef, useState } from 'react';
import { useAuth } from './use-auth';
import { useUserCompanies } from './use-user-companies';
import { useQueryClient } from '@tanstack/react-query';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export function useWebSocket() {
  const { user } = useAuth();
  const { selectedCompany } = useUserCompanies(user?.id || '');
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Register client with user and company info
      ws.send(JSON.stringify({
        type: 'register',
        userId: user.id,
        empresaId: selectedCompany?.id
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        console.log('WebSocket message received:', message);
        
        // Handle different message types
        switch (message.type) {
          case 'arte_created':
            // Invalidate arts queries to refetch data
            queryClient.invalidateQueries({ queryKey: ['/api/arts/by-company'] });
            break;
            
          case 'arte_archived':
            // Invalidate both active and archived arts queries
            queryClient.invalidateQueries({ queryKey: ['/api/arts/by-company'] });
            queryClient.invalidateQueries({ queryKey: ['/api/arts/archived'] });
            break;
            
          case 'arte_unarchived':
            // Invalidate both active and archived arts queries
            queryClient.invalidateQueries({ queryKey: ['/api/arts/by-company'] });
            queryClient.invalidateQueries({ queryKey: ['/api/arts/archived'] });
            break;
            
          case 'empresa_updated':
            // Invalidate company-related queries
            queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
            break;
            
          case 'template_created':
            // Invalidate templates queries
            queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
            break;
            
          case 'ai_content_completed':
            // Invalidate AI content queries to show new results
            queryClient.invalidateQueries({ queryKey: ['/api/ai-content'] });
            break;
            
          case 'pong':
            // Handle pong silently
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    // Ping/pong for connection keep-alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [user?.id, selectedCompany?.id, queryClient]);

  // Update registration when selected company changes
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && user?.id) {
      wsRef.current.send(JSON.stringify({
        type: 'register',
        userId: user.id,
        empresaId: selectedCompany?.id
      }));
    }
  }, [selectedCompany?.id, user?.id]);

  return {
    isConnected,
    lastMessage,
    sendMessage: (message: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    }
  };
}