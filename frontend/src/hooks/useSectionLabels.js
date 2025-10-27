import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addSectionLabel, 
  updateSectionLabel, 
  removeSectionLabel, 
  resizeSectionLabel, 
  moveSectionLabel 
} from '../Redux/Slice/studio.slice';
import { selectStudioState } from '../Redux/rootReducer';

export const useSectionLabels = () => {
  const dispatch = useDispatch();
  const sectionLabels = useSelector((state) => selectStudioState(state)?.sectionLabels || []);
  const audioDuration = useSelector((state) => selectStudioState(state)?.audioDuration || 150);

  const createSection = useCallback((sectionData = {}) => {
    const newSection = {
      name: sectionData.name || 'New Section',
      startTime: sectionData.startTime || 0,
      endTime: sectionData.endTime || 10,
      width: sectionData.width || 100,
      ...sectionData
    };
    dispatch(addSectionLabel(newSection));
    return newSection;
  }, [dispatch]);

  const updateSection = useCallback((sectionId, updates) => {
    dispatch(updateSectionLabel({ id: sectionId, updates }));
  }, [dispatch]);

  const deleteSection = useCallback((sectionId) => {
    dispatch(removeSectionLabel(sectionId));
  }, [dispatch]);

  const resizeSection = useCallback((sectionId, newWidth, newStartTime, newEndTime, newPosition) => {
    dispatch(resizeSectionLabel({
      sectionId,
      newWidth,
      newStartTime,
      newEndTime,
      newPosition
    }));
  }, [dispatch]);

  const moveSection = useCallback((sectionId, newStartTime, newEndTime, newPosition) => {
    dispatch(moveSectionLabel({
      sectionId,
      newStartTime,
      newEndTime,
      newPosition
    }));
  }, [dispatch]);

  const getSectionById = useCallback((sectionId) => {
    return sectionLabels.find(section => section.id === sectionId);
  }, [sectionLabels]);

  const getSectionsInTimeRange = useCallback((startTime, endTime) => {
    return sectionLabels.filter(section => 
      (section.startTime >= startTime && section.startTime <= endTime) ||
      (section.endTime >= startTime && section.endTime <= endTime) ||
      (section.startTime <= startTime && section.endTime >= endTime)
    );
  }, [sectionLabels]);

  const duplicateSection = useCallback((sectionId) => {
    const section = getSectionById(sectionId);
    if (section) {
      const duplicatedSection = {
        ...section,
        name: `${section.name}`,
        startTime: section.startTime + (section.endTime - section.startTime),
        endTime: section.endTime + (section.endTime - section.startTime)
      };
      dispatch(addSectionLabel(duplicatedSection));
    }
  }, [dispatch, getSectionById]);

  return {
    sectionLabels,
    audioDuration,
    createSection,
    updateSection,
    deleteSection,
    resizeSection,
    moveSection,
    getSectionById,
    getSectionsInTimeRange,
    duplicateSection
  };
};
