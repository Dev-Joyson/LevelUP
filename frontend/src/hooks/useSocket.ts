import { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/lib/socket-service';
import type { Socket } from 'socket.io-client';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;

    const initializeSocket = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        console.log('Initializing socket connection...');

        // Check if we already have a connected socket
        if (socketService.isConnected && socketService.socketInstance) {
          console.log('Using existing connected socket');
          setSocket(socketService.socketInstance);
          setIsConnected(true);
          setError(null);
          return;
        }

        // If socket exists but not connected, try to reconnect
        if (socketService.socketInstance && !socketService.isConnected) {
          console.log('Socket exists but disconnected, attempting reconnection...');
          try {
            socketService.socketInstance.connect();
            // Wait a bit to see if connection succeeds
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Reconnection timeout')), 5000);
              socketService.socketInstance!.once('connect', () => {
                clearTimeout(timeout);
                resolve(true);
              });
              socketService.socketInstance!.once('connect_error', (err) => {
                clearTimeout(timeout);
                reject(err);
              });
            });
            
            setSocket(socketService.socketInstance);
            setIsConnected(true);
            setError(null);
            console.log('Socket reconnected successfully');
            return;
          } catch (reconnectError) {
            console.log('Reconnection failed, creating new socket');
          }
        }

        // Create new socket connection
        const connectedSocket = await socketService.connect(token);
        setSocket(connectedSocket);
        setIsConnected(true);
        setError(null);
        console.log('New socket connection established');

      } catch (err) {
        console.error('Socket connection error:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to server');
        setIsConnected(false);
        setSocket(null);

        // Try to reconnect after a delay
        reconnectTimer = setTimeout(() => {
          console.log('Attempting automatic reconnection...');
          initializeSocket();
        }, 3000);
      }
    };

    // Set up connection status listeners
    const handleConnect = () => {
      console.log('Socket connected event received');
      setIsConnected(true);
      setError(null);
      setSocket(socketService.socketInstance);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      
      if (reason === 'io client disconnect') {
        // Client initiated disconnect, don't show error
        setError(null);
      } else {
        setError('Connection lost. Reconnecting...');
        
        // Try to reconnect after a delay
        reconnectTimer = setTimeout(() => {
          console.log('Auto-reconnecting after disconnect...');
          initializeSocket();
        }, 2000);
      }
    };

    const handleConnectError = (error: any) => {
      console.error('Socket connection error event:', error);
      setError('Connection failed. Retrying...');
      setIsConnected(false);
      
      // Try to reconnect after a delay
      reconnectTimer = setTimeout(() => {
        console.log('Retrying connection after error...');
        initializeSocket();
      }, 3000);
    };

    const handleReconnect = () => {
      console.log('Socket reconnected successfully');
      setIsConnected(true);
      setError(null);
      setSocket(socketService.socketInstance);
    };

    // Initialize socket
    initializeSocket();

    // Add listeners after initialization
    const setupListeners = () => {
      if (socketService.socketInstance) {
        socketService.socketInstance.on('connect', handleConnect);
        socketService.socketInstance.on('disconnect', handleDisconnect);
        socketService.socketInstance.on('connect_error', handleConnectError);
        socketService.socketInstance.on('reconnect', handleReconnect);
      }
    };

    // Setup listeners immediately if socket exists, otherwise wait a bit
    if (socketService.socketInstance) {
      setupListeners();
    } else {
      setTimeout(setupListeners, 100);
    }

    return () => {
      // Clear any pending reconnect timer
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      // Clean up listeners
      if (socketService.socketInstance) {
        socketService.socketInstance.off('connect', handleConnect);
        socketService.socketInstance.off('disconnect', handleDisconnect);
        socketService.socketInstance.off('connect_error', handleConnectError);
        socketService.socketInstance.off('reconnect', handleReconnect);
      }
    };
  }, []);

  // Helper function to wait for socket connection
  const waitForConnection = useCallback(async (maxWaitTime: number = 10000): Promise<boolean> => {
    if (socketService.isConnected && socketService.socketInstance?.connected) {
      return true;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkConnection = () => {
        if (socketService.isConnected && socketService.socketInstance?.connected) {
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime > maxWaitTime) {
          resolve(false);
          return;
        }
        
        setTimeout(checkConnection, 100);
      };
      
      checkConnection();
    });
  }, []);

  // Mock Interview methods
  const startInterview = useCallback(async (mockInterviewId: string): Promise<any> => {
    console.log('🚀 startInterview called, checking connection...');
    
    // Wait for connection with timeout
    const isReady = await waitForConnection(5000);
    
    if (!isReady || !socketService.isConnected || !socketService.socketInstance?.connected) {
      console.error('❌ Socket not ready after waiting');
      throw new Error('Socket connection not ready. Please try again.');
    }

    console.log('✅ Socket is ready, starting interview...');
    
    return new Promise<any>((resolve, reject) => {
      if (!socketService.socketInstance) {
        reject(new Error('Socket not available'));
        return;
      }

      // Declare timeout ID variable
      let timeoutId: NodeJS.Timeout;

      // Cleanup function
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        socketService.socketInstance?.off('interview-started', onInterviewStarted);
        socketService.socketInstance?.off('interview-error', onInterviewError);
      };

      // Listen for response
      const onInterviewStarted = (data: any) => {
        console.log('✅ Interview started successfully:', data);
        cleanup();
        resolve(data);
      };

      const onInterviewError = (data: { message: string }) => {
        console.error('❌ Interview start error:', data);
        cleanup();
        reject(new Error(data.message));
      };

      socketService.socketInstance.on('interview-started', onInterviewStarted);
      socketService.socketInstance.on('interview-error', onInterviewError);

      // Start interview
      console.log('📡 Emitting start-interview event...');
      try {
        socketService.startInterview(mockInterviewId);
      } catch (error) {
        console.error('❌ Error emitting start-interview:', error);
        cleanup();
        reject(error);
        return;
      }

      // Timeout after 20 seconds (increased from 10s to handle database operations)
      timeoutId = setTimeout(() => {
        console.error('❌ Interview start timeout after 20 seconds');
        cleanup();
        reject(new Error('Interview initialization is taking longer than expected. Please check if the interview has started or try refreshing the page.'));
      }, 20000);
    });
  }, [waitForConnection]);

  const submitAnswer = useCallback(async (sessionId: string, answer: string, questionNumber: number) => {
    if (!socketService.isConnected) {
      throw new Error('Socket not connected');
    }
    socketService.submitAnswer(sessionId, answer, questionNumber);
  }, []);

  const terminateInterview = useCallback(async (sessionId: string, reason: string = 'User terminated') => {
    if (!socketService.isConnected) {
      throw new Error('Socket not connected');
    }
    socketService.terminateInterview(sessionId, reason);
  }, []);

  return { 
    socket, 
    isConnected, 
    error, 
    startInterview, 
    submitAnswer, 
    terminateInterview 
  };
}

