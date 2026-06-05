import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { DeleteAllChatList, ReadChatHistories, UpdateChat } from '../../services/troubleshooting.ts';
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
  onSideBarclose: () => void;
  onNewChatClick: () => void;
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
  
  const Sidebar: React.FC<Props> = ({ history = [], onChatDeleteClick, getChatList, onSideBarclose, onNewChatClick }) => {
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
      setSelectedItem(null);
      onSideBarclose();
      onNewChatClick();
    };
  
    const handleChatClick = async (item: any) => {
      setSelectedItem(item)
      onSideBarclose();
      navigate(`/ai-studio/troubleshooting?chat_id=${item?.id}`);
      if (item.id != chat_id) {
        getPageChat(item.id);
      }
    };
  
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
        navigate(`/ai-studio/troubleshooting`);
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
      <div className="w-full bg-primary_text flex space-y-2 md:space-y-1 flex-col p-2 md:p-1 mt-24 md:mt-2">
        <Button
          onClick={handleNewChatClick}
          size="medium"
          custom_type="secondary"
          className="mx-2 mt-4 flex items-center"
        >
          <img
            src={PlusIcon}
            alt="New Chat"
            className="mr-2 w-4 h-4 md:w-5 md:h-5"
          />
          <Text type="small">New Chat</Text>
        </Button>
  
        <div className="mb-4 max-h-[50vh] md:max-h-[53vh] w-full overflow-y-auto overflow-x-hidden">
          {Object.keys(groupedHistory).map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-4 w-full">
              <Text
                className="text-background mt-4 mb-2 text-start pb-2 pl-4 md:pl-8 w-full border-b-2 border-[#EFEFEF] inset-x-0 text-xs md:text-sm"
                type="small"
              >
                {category}
              </Text>
              {groupedHistory[category].map((item, index) => (
                <div key={index} className="-mb-3">
                  {editChat.index === index ? (
                    <div className="flex border-grey rounded focus-within:bg-[#373737] px-3 md:px-4">
                      <img
                        src={MessageIcon}
                        alt="Message"
                        className="w-4 h-4 md:w-5 md:h-5"
                      />
                      <input
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={() => updateChatTitle(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, item)}
                        className="bg-inherit h-10 md:h-12 text-background px-3 md:px-4 focus:outline-none focus:ring-none rounded-md border-none text-[12px] md:text-[14px] flex items-center justify-between w-full"
                      />
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleChatClick(item)}
                      custom_type="normal"
                      size="medium"
                      className={`border-none hover:bg-[#373737] ${
                        item.id === selectedItem?.id
                          ? "bg-[#373737]"
                          : "bg-inherit"
                      } h-10 md:h-11 my-3 md:my-4 flex items-center pr-4 w-full group`}
                    >
                      <div className="flex items-center flex-grow">
                        <img
                          src={MessageIcon}
                          alt="Message"
                          className="mr-3 w-4 h-4 md:mr-4 md:w-5 md:h-5"
                        />
                        <div className="w-[60vw] md:w-[11vw] flex justify-start">
                          <Text
                            className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs md:text-sm w-full"
                            title={item.title}
                            type="small"
                          >
                            {item.title}
                          </Text>
                        </div>
                      </div>
                      <div className="flex lg:opacity-0 group-hover:opacity-100 ml-1 md:ml-2 ">
                        <DropDownMenu
                          onChange={(title: string) =>
                            onChange(title, item, index)
                          }
                          content={<More />}
                          menuItems={MenuItems}
                        />
                      </div>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="fixed bottom-[20vh] md:bottom-[23vh] left-0 right-0 border-b-2 border-[#EFEFEF]" />
        <div
          onClick={() => { dispatch.modal.openConfirmation(); onSideBarclose()}}
          className="flex self-start flex-row ml-16 md:ml-[3.5vw] bottom-[14vh] md:bottom-[17vh] space-x-2 hover:cursor-pointer fixed"
        >
          <img src={DeleteIcon} alt="Clear All Chats" className="w-4 h-4" />
          <Text className="text-white text-xs md:text-sm" type="small">
            Clear Conversation
          </Text>
        </div>
  
        <Button
          onClick={() => navigate("/ai-studio/troubleshooting/settings")}
          className="mx-4 md:mx-[0.5vw] flex items-start left-2 md:left-[0.5vw] w-[85%] md:w-[18vw] bottom-[5vh] space-x-2 fixed"
          custom_type="secondary"
          rounded
          size="medium"
        >
          <img
            src={SettingsIcon}
            alt="Settings"
            className="self-start w-10 h-10 md:w-8 md:h-8"
          />
          <Text type="small">Settings</Text>
        </Button>
  
        {confirmationStatus && (
          <ConfirmationModal
            title="Clear Chat"
            content="Are you sure you want to clear all chat history?"
            onSubmit={handleDeleteAllChats}
          />
        )}
      </div>
    );
};

export default Sidebar;