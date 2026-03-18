import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { DeleteAllChatList, ReadChatHistories, UpdateChat } from '../../services/edge';
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
    try {
      const response = await ReadChatHistories(0, 100, value);
      if (response) {
        dispatch.chatContent.addChat(response.result);
      }
    } catch (error) {
      console.error('Error fetching page chat:', error);
    }
  };

  const handleNewChatClick = () => {
    setSelectedItem(null)
    navigate(`/ai-studio/edge`);
    dispatch.chatContent.clearChat();
  };

  const handleChatClick = async (item: any) => {
    setSelectedItem(item)
    navigate(`/ai-studio/edge?chat_id=${item?.id}`);
    if (item.id != chat_id) {
      getPageChat(item.id);
    }
  };

  // const handleDelete = async (event: React.MouseEvent<HTMLImageElement, MouseEvent>, item: any) => {
  //   event.stopPropagation();
  //   onChatDeleteClick(item);
  // };

  // const handleEdit = (event: React.MouseEvent<HTMLImageElement, MouseEvent>, item: any, index: number) => {
  //   event.stopPropagation();
  //   setEditChat({ status: true, index });
  //   setInputValue(item.title);
  // };

  const updateChatTitle = async (chat_id: number) => {
    try {
      await UpdateChat(chat_id, inputValue);
      setEditChat({ status: false, index: null });
      getChatList();
    } catch (error) {
      console.error('Error updating chat title:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, item: any) => {
    if (event.key === 'Enter' && inputValue) {
      updateChatTitle(item.id);
    }
  };

  const handleDeleteAllChats = async () => {
    try {
      await DeleteAllChatList();
      navigate(`/ai-studio/edge`);
      dispatch.chatContent.clearChat();
      getChatList();
    } catch (error) {
      console.error('Error deleting all chats:', error);
    }
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
    <div className="w-full bg-primary_text flex flex-col">
      <Button onClick={handleNewChatClick} size="medium" custom_type="secondary" className="mx-[1vw] mt-6 flex items-center">
        <img src={PlusIcon} alt="New Chat" className="mr-2" />
        <Text type="small">New Chat</Text>
      </Button>
      <div className='mb-5 max-h-[53vh] overflow-y-auto overflow-x-hidden'>
        {Object.keys(groupedHistory).map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <Text className="text-background mt-4 mb-2 text-start pl-8 w-full border-b-2 border-[#EFEFEF]" type="small">
              {category}
            </Text>
            {groupedHistory[category].map((item, index) => (
              <div key={index} className="-mb-3">
                {editChat.index === index ? (
                  <div className='flex border-grey rounded md focus-within:bg-[#373737] px-4'>
                    <img src={MessageIcon} alt="Message" />
                    <input
                      autoFocus
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => updateChatTitle(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      className="bg-inherit h-12 text-background px-4 focus:outline-none focus:none focus:ring-none rounded-md border-none bg-inherit text-[14px] flex items-center justify-between w-full"
                    />
                  </div>

                ) : (
                  <Button
                    onClick={() => handleChatClick(item)}
                    custom_type="normal"
                    size="medium"
                    className={`border-none hover:bg-[#373737] ${item.id === selectedItem?.id ? 'bg-[#373737]' : 'bg-inherit'} h-11 my-4 flex items-center gap-1 justify-between w-full group`}
                  >
                    <div className="flex items-center flex-grow">
                      <img src={MessageIcon} alt="Message" className="mr-2" />
                      <div className="w-[11vw] flex justify-start">
                        <Text className='block overflow-hidden text-ellipsis whitespace-nowrap' title={item.title} type="small">
                          {item.title}
                        </Text>
                      </div>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100">
                      <DropDownMenu onChange={(title: string) => onChange(title, item, index)} content={<More />} menuItems={MenuItems} />
                    </div>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="fixed bottom-[23vh] left-0 right-[83.1vw] border-b-2 border-[#EFEFEF]" />
      <div onClick={() => dispatch.modal.openConfirmation()} className="flex self-start flex-row ml-[1.5vw] bottom-[17vh] space-x-2 hover:cursor-pointer fixed">
        <img src={DeleteIcon} alt="Clear All Chats" className="w-4 h-4" />
        <Text className="text-white" type="small">Clear Conversation</Text>
      </div>
      <Button
        onClick={() => navigate('/ai-studio/edge/settings')}
        className="mx-[0.5vw] flex self items-start left-[0.4vw] w-[15vw] bottom-[5vh] space-x-2 fixed"
        custom_type="secondary"
        rounded
        size="medium"
      >
        <img src={SettingsIcon} alt="Settings" className="self-start" />
        <Text type="small">Settings</Text>
      </Button>
      {confirmationStatus && <ConfirmationModal title='Clear Chat' content='Are you sure you want to clear all chat history?' onSubmit={handleDeleteAllChats} />}
    </div>
  );
};

export default Sidebar;
