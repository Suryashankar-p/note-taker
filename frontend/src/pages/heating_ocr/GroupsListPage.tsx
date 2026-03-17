import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Text from "../../components/Text";
import Button from "../../components/Button";
import { GetActivityGroups, GetGroupActivityData, SentMultipartMessage } from "../../services/heating_ocr";
import NoData from "../../assets/no_data";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import ConfirmationModal from "../../components/Modals/ConfirmationModal";

interface GroupValidationStatus {
  group: string[];
  isValid: boolean;
  invalidCount: number;
  isLoading: boolean;
}

const GroupsListPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activity = location?.state?.activity;
  const activityId = searchParams.get("activity_id");
  
  const [groups, setGroups] = useState<string[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupValidations, setGroupValidations] = useState<Map<string, GroupValidationStatus>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [confirmationData, setConfirmationData] = useState<{ type: string; title: string; content: string } | null>(null);
  const dispatch = useDispatch<Dispatch>();
  const confirmationStatus = useSelector((state: RootState) => state.modal.confirmation);

  useEffect(() => {
    if (activityId) {
      fetchGroups();
    }
  }, [activityId]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await GetActivityGroups(Number(activityId));
      if (response && Array.isArray(response)) {
        setGroups(response);
        // Initialize validation status for each group
        const initialValidations = new Map<string, GroupValidationStatus>();
        response.forEach((group: string[]) => {
          const key = `${group[0]}_${group[1]}`;
          initialValidations.set(key, {
            group,
            isValid: true,
            invalidCount: 0,
            isLoading: true,
          });
        });
        setGroupValidations(initialValidations);
        // Fetch validation status for each group
        fetchAllGroupValidations(response);
      } else {
        setGroups([]);
      }
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      dispatch.toast?.openToast?.({
        status: true,
        message: err?.response?.data?.detail || "Failed to fetch groups",
        type: "error",
      });
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };
  const isActivityFinalized = () => {
    return activity?.status === "SUBMITTED" || 
           activity?.status === "REJECTED" ||
           activity?.status === "SUBMITTED_SUCCESS" ||
           activity?.status === "SUBMITTED_WAITING" ||
           activity?.status === "SUBMITTED_FAILED";
  };
  const fetchAllGroupValidations = async (groupsList: string[][]) => {
    // Fetch validation status for each group in parallel
    const validationPromises = groupsList.map(async (group) => {
      const key = `${group[0]}_${group[1]}`;
      try {
        const response = await GetGroupActivityData(Number(activityId), group);
        if (response && Array.isArray(response)) {
          const invalidFields = response.filter((field: any) => !field.is_valid);
          return {
            key,
            status: {
              group,
              isValid: invalidFields.length === 0,
              invalidCount: invalidFields.length,
              isLoading: false,
            },
          };
        }
        return {
          key,
          status: {
            group,
            isValid: true,
            invalidCount: 0,
            isLoading: false,
          },
        };
      } catch (err) {
        console.error(`Error fetching validation for group ${key}:`, err);
        return {
          key,
          status: {
            group,
            isValid: true,
            invalidCount: 0,
            isLoading: false,
          },
        };
      }
    });

    const results = await Promise.all(validationPromises);
    
    setGroupValidations((prev) => {
      const newMap = new Map(prev);
      results.forEach(({ key, status }) => {
        newMap.set(key, status);
      });
      return newMap;
    });
  };

  const getGroupValidation = (group: string[]): GroupValidationStatus => {
    const key = `${group[0]}_${group[1]}`;
    return groupValidations.get(key) || {
      group,
      isValid: true,
      invalidCount: 0,
      isLoading: true,
    };
  };

  const handleGroupClick = (group: string[]) => {
    navigate(`/ai-studio/heating_ocr?activity_id=${activityId}&view=group`, {
      state: { 
        activity, 
        group,
        isGroupView: true
      },
    });
  };

  const handleBack = () => {
    navigate("/ai-studio/heating_ocr");
  };

  // Check if all groups are valid
  const hasInvalidGroups = () => {
    return Array.from(groupValidations.values()).some(v => !v.isValid);
  };

  // Submit all groups together
  const handleSubmitAll = async () => {
    if (hasInvalidGroups()) {
      dispatch.toast?.openToast?.({
        status: true,
        message: "Please fix all invalid fields before submitting",
        type: "error",
      });
      return;
    }

    // Open Redux confirmation modal
    dispatch.modal.openConfirmation();
    setConfirmationData({
      type: "submit",
      title: "Submit All Groups",
      content: `Are you sure you want to submit all ${groups.length} groups? This action cannot be undone.`,
    });
  };

  const handleRejectAll = async () => {
    // Open Redux confirmation modal
    dispatch.modal.openConfirmation();
    setConfirmationData({
      type: "reject",
      title: "Reject All Groups",
      content: `Are you sure you want to reject all ${groups.length} groups? This action cannot be undone.`,
    });
  };

  const handleConfirmation = async (type: string) => {
    if (type === "submit") {
      confirmSubmit();
    } else if (type === "reject") {
      confirmReject();
    }
  };

  const confirmSubmit = async () => {
    dispatch.modal.closeConfirmation();
    setIsSubmitting(true);
    try {
      // Send "SUBMITTED" instead of "SUBMIT"
      const response = await SentMultipartMessage(Number(activityId), "SUBMITTED");
      if (response?.id) {
        dispatch.toast?.openToast?.({
          status: true,
          message: "All groups submitted successfully!",
          type: "success",
        });
        setTimeout(() => {
          navigate("/ai-studio/heating_ocr");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error submitting groups:", error);
      dispatch.toast?.openToast?.({
        status: true,
        message: error?.response?.data?.detail || "Failed to submit groups",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmReject = async () => {
    dispatch.modal.closeConfirmation();
    setIsRejecting(true);
    try {
      // Send "REJECTED" instead of "REJECT"
      const response = await SentMultipartMessage(Number(activityId), "REJECTED");
      if (response?.id) {
        dispatch.toast?.openToast?.({
          status: true,
          message: "All groups rejected successfully!",
          type: "success",
        });
        setTimeout(() => {
          navigate("/ai-studio/heating_ocr");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error rejecting groups:", error);
      dispatch.toast?.openToast?.({
        status: true,
        message: error?.response?.data?.detail || "Failed to reject groups",
        type: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getValidationSummary = () => {
    let validCount = 0;
    let invalidCount = 0;
    let loadingCount = 0;

    groupValidations.forEach((status) => {
      if (status.isLoading) {
        loadingCount++;
      } else if (status.isValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    });

    return { validCount, invalidCount, loadingCount };
  };

  const renderValidationBadge = (validation: GroupValidationStatus) => {
    if (validation.isLoading) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
          <div className="animate-spin h-3 w-3 border border-gray-400 rounded-full border-t-transparent"></div>
          <span>Validating...</span>
        </div>
      );
    }

    if (validation.isValid) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Valid</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{validation.invalidCount} Invalid</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const summary = getValidationSummary();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#5f6368">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <div>
          <Text type="header2" className="text-2xl font-bold">
            Plate Groups
          </Text>
          {activity && (
            <Text type="small" className="text-faint_text">
              Activity: {activity?.title}
            </Text>
          )}
        </div>
      </div>

      {/* Validation Summary */}
      <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        <Text type="small" className="text-gray-600">
          Groups Summary:
        </Text>
        {summary.loadingCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <div className="animate-spin h-3 w-3 border border-gray-400 rounded-full border-t-transparent"></div>
            <span>{summary.loadingCount} Loading</span>
          </div>
        )}
        {summary.validCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4m5 5a9 9 0 11-18 0a9 9 0 0118 0z" />
            </svg>
            <span>{summary.validCount} Valid</span>
          </div>
        )}
        {summary.invalidCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-yellow-600">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{summary.invalidCount} Invalid</span>
          </div>
        )}
      </div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pr-2">
            {groups.map((group, index) => {
              const validation = getGroupValidation(group);
              const cardBorderClass = validation.isLoading
                ? "border-gray-200"
                : validation.isValid
                ? "border-green-200 hover:border-green-400"
                : "border-yellow-300 hover:border-yellow-500";

              return (
                <div
                  key={index}
                  onClick={() => handleGroupClick(group)}
                  className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 bg-white ${cardBorderClass}`}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <Text type="small" className="text-gray-500">
                        Group #{index + 1}
                      </Text>
                      {renderValidationBadge(validation)}
                    </div>
                    
                    <div className="border-t pt-2 mt-2">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Text type="small" className="text-gray-500 w-24">
                            Heat No:
                          </Text>
                          <Text type="body" className="font-semibold text-gray-800">
                            {group[0] || "N/A"}
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <Text type="small" className="text-gray-500 w-24">
                            Plate No:
                          </Text>
                          <Text type="body" className="font-semibold text-gray-800">
                            {group[1] || "N/A"}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Show invalid field count if any */}
                    {!validation.isLoading && !validation.isValid && (
                      <div className="text-xs text-yellow-600 mt-1">
                        {validation.invalidCount} field{validation.invalidCount > 1 ? 's' : ''} need{validation.invalidCount === 1 ? 's' : ''} attention
                      </div>
                    )}

                    <div className="flex justify-end mt-2">
                      <Button
                        type="button"
                        className="text-sm px-3 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGroupClick(group);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Common Submit/Reject Buttons at Bottom */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              onClick={handleBack}
            >
              Cancel
            </Button>

            {/* Reject Button - Disabled if activity is finalized */}
            <Button
              type="button"
              disabled={isRejecting || summary.loadingCount > 0 || isActivityFinalized()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                isRejecting || summary.loadingCount > 0 || isActivityFinalized()
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
              onClick={handleRejectAll}
            >
              {isRejecting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Rejecting...
                </>
              ) : isActivityFinalized() ? (
                `Reject All Groups (${groups.length})`
              ) : (
                `Reject All Groups (${groups.length})`
              )}
            </Button>

            {/* Submit Button - Enabled ONLY when 0 invalid groups AND activity not finalized */}
            <Button
              type="button"
              disabled={isSubmitting || summary.invalidCount > 0 || summary.loadingCount > 0 || isActivityFinalized()}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                isSubmitting || summary.loadingCount > 0 || isActivityFinalized()
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : summary.invalidCount > 0
                  ? "bg-yellow-400 text-gray-800 cursor-not-allowed"
                  : "bg-danger text-white hover:bg-red-700"
              }`}
              onClick={handleSubmitAll}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  {summary.invalidCount > 0 && !isActivityFinalized() && (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  Submit All Groups ({groups.length})
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-64">
          <NoData />
          <Text type="body" className="text-gray-500 mt-4">
            No groups found for this activity
          </Text>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmationStatus && (
        <ConfirmationModal
          onSubmit={() => handleConfirmation(confirmationData?.type)}
          title={confirmationData?.title}
          content={confirmationData?.content}
        />
      )}
    </div>
  );
};

export default GroupsListPage;
