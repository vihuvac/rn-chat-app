import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import io from 'socket.io-client';
import type {Socket} from 'socket.io-client';

import {Colors} from 'react-native/Libraries/NewAppScreen';

// Define the event name.
const MESSAGE_EVENT = 'chat_message';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const Section = ({children, title}: SectionProps): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = (): React.JSX.Element => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [socketInstance, setSocketInstance] = useState<Socket>();

  const handleChatMessageChange = (message: string) => {
    setChatMessage(message);
  };

  const handleSubmitChatMessage = () => {
    if (socketInstance) {
      socketInstance.emit(MESSAGE_EVENT, chatMessage);
      setChatMessage('');
    }
  };

  const renderChatMessage = ({item}: any) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item}</Text>
    </View>
  );

  useEffect(() => {
    const socket = io('ws://localhost:4000');

    socket.on('connect', () => {
      console.log('Connected to socket server.');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server.');
    });

    // Listen for messages from the server (in this case the message emitted by the server has the same name).
    socket.on(MESSAGE_EVENT, message => {
      setChatMessages(prevMessages => {
        // Check if the message is already in the state to prevent duplicates.
        if (!prevMessages.includes(message)) {
          return [...prevMessages, message];
        }
        return prevMessages; // Return the state unchanged if the message is a duplicate.
      });
    });

    setSocketInstance(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.white,
    flex: 1,
  };

  const sectionBackground = {
    backgroundColor: isDarkMode ? Colors.lighter : Colors.white,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={sectionBackground}>
        <Section title="Welcome">
          This is a POC to test the connection between a{' '}
          <Text style={styles.highlight}>RNA</Text> and a{' '}
          <Text style={styles.highlight}>Socket.IO Server</Text>.
        </Section>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          autoCorrect={false}
          value={chatMessage}
          onChangeText={handleChatMessageChange}
          onSubmitEditing={handleSubmitChatMessage}
          placeholder="Type a message..."
        />
      </KeyboardAvoidingView>
      {chatMessages.length > 0 && (
        <View style={styles.chatContainer}>
          <Text style={[styles.sectionTitle, styles.chatMessagesTitle]}>
            Chat Messages
          </Text>
          <FlatList
            style={styles.flatList}
            data={chatMessages}
            renderItem={renderChatMessage}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    marginBottom: 42,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  inputContainer: {
    marginVertical: 10,
  },
  messageInput: {
    padding: 10,
    margin: 10,
    height: 40,
    borderRadius: 5,
    borderColor: 'gray',
    borderWidth: 1,
  },
  messageContainer: {
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  messageText: {
    fontSize: 16,
  },
  chatMessagesTitle: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  chatContainer: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});

export default App;
