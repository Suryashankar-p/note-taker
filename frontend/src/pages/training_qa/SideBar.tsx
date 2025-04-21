import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import Button from '../../components/Button';
import Text from '../../components/Text';
import PlusIcon from '../../assets/plus_icon.svg';
import MessageIcon from '../../assets/message.svg';
import SettingsIcon from '../../assets/settings.svg';
import DeleteIcon from '../../assets/delete.svg';
import './styles.css';
import More from '../../assets/More';
import DropDownMenu from '../../components/DropdownMenu';
import Edit from '../../assets/edit.svg';
import Trash from '../../assets/trash.svg';
import ConfirmationModal from '../../components/Modals/ConfirmationModal';
import { categorizeDate } from '../../utils/functions';

interface Props {
  history: any[];
  onChatDeleteClick: (item: any) => void;
  getChatList: () => void;
}

interface EditType {
  status: boolean;
  index: number | null;
}


const MenuItems = [
  {
    title: 'Edit',
    component: <img src={Edit} alt="edit" loading="lazy" />
  },
  {
    title: 'Delete',
    component: <img src={Trash} alt="trash" loading="lazy" />
  }
]

const Sidebar: React.FC<Props> = ({ history = [], onChatDeleteClick, getChatList }) => {
  const [editChat, setEditChat] = useState<EditType>({ status: false, index: null });
  const [inputValue, setInputValue] = useState<string>('');
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chat_id = searchParams.get('chat_id')
  const confirmationStatus = useSelector((state: RootState) => state.modal.confirmation);
  const [selectedItem, setSelectedItem] = useState<any>()

  const getPageChat = async (value: any) => {
    // try {
    //   const response = await ReadChatHistories(0, 100, value);
    //   if (response) {
    //     dispatch.chatContent.addChat(response.result);
    //   }
    // } catch (error) {
    //   console.error('Error fetching page chat:', error);
    // }
  };

  const handleNewChatClick = () => {
    dispatch.chatContent.clearChat();

  };

  const handleChatClick = async (item: any) => {

  };


  const updateChatTitle = async (chat_id: number) => {
    // try {
    //   await UpdateChat(chat_id, inputValue);
    //   setEditChat({ status: false, index: null });
    //   getChatList();
    // } catch (error) {
    //   console.error('Error updating chat title:', error);
    // }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, item: any) => {
    if (event.key === 'Enter' && inputValue) {
      updateChatTitle(item.id);
    }
  };

  const handleDeleteAllChats = async () => {
    // try {
    //   await DeleteAllChatList();
    //   navigate(`/ai-studio/sales`);
    //   dispatch.chatContent.clearChat();
    //   getChatList();
    // } catch (error) {
    //   console.error('Error deleting all chats:', error);
    // }
  };


  const onChange = (title: string, item: any, index: number) => {
    if (title === 'Edit') {
      setEditChat({ status: true, index });
      setInputValue(item.title);
    }
    else if (title === 'Delete') {
      onChatDeleteClick(item);
    }
  }

  function groupHistoryByDate(history: any[]) {
    const groups: { [key: string]: any[] } = {};
    history.forEach(item => {
      const category = categorizeDate(item.created_on);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    return groups;
  }

  const groupedHistory = groupHistoryByDate(history);

  return (
    <div className="w-full bg-primary_text relative flex flex-col">
      <Button onClick={handleNewChatClick} size="large" custom_type="secondary" className="mx-[1vw] mt-6 flex fixed items-center">
        <img src={PlusIcon} alt="New Chat" className="" />
        <Text type="small">New Chat</Text>
      </Button>
    </div>
  );
};

export default Sidebar;
