import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { FiTrash2 } from 'react-icons/fi';
import { useNavigate } from "react-router-dom";
import { permanentDeleteAllMusic, permanentDeleteMusic, restoreAllMusic, restoreMusic, getDeletedMusic } from "../Redux/Slice/music.slice";
import { FaChevronLeft } from "react-icons/fa6";
import notFound from '../Images/notFound.png'
import { HiDotsVertical } from "react-icons/hi";

const generateRandomColor = (seed) => {
	const colors = [
		'#AA005B', 
		'#611364', 
		'#F59B23', 
		'#E33751', 
		'#14833B', 
		'#1A8CDE', 
		'#FA6033', 
		'#2D46B9',
	];
	
	// Use seed to get consistent color for same item
	const index = Math.abs(seed.split('').reduce((a, b) => {
		a = ((a << 5) - a) + b.charCodeAt(0);
		return a & a;
	}, 0)) % colors.length;
	
	return colors[index];
};

function RecentlyDeleted() {
	const dispatch = useDispatch();
	const { deletedmusic, loading } = useSelector(state => state.music);
	
	// Modal state for restore all
	const [showRestoreAllModal, setShowRestoreAllModal] = useState(false);
	// Modal state for permanently delete all
	const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
	
	// Show modal for restore all
	const handleRestoreAll = () => {
		setShowRestoreAllModal(true);
	};

	// Cancel restore all
	const handleRestoreAllCancel = () => {
		setShowRestoreAllModal(false);
	};

	// Show modal for permanently delete all
	const handlePermanentDeleteAll = () => {
		setShowDeleteAllModal(true);
	};

	// Cancel permanently delete all
	const handleDeleteAllCancel = () => {
		setShowDeleteAllModal(false);
	};
	
	const navigate = useNavigate();
	
	// Fetch deleted music from backend on component mount
	useEffect(() => {
		dispatch(getDeletedMusic());
	}, [dispatch]);

	const [showRestoreModal, setShowRestoreModal] = useState(false);
	const [restoreIdx, setRestoreIdx] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteIdx, setDeleteIdx] = useState(null);
	

	// Handler for restore button click (shows modal)
	const handleRestoreClick = (idx) => {
		setRestoreIdx(idx);
		setShowRestoreModal(true);
	};

	// Handler for confirming restore in modal
	const handleRestoreConfirm = async () => {
		if (restoreIdx !== null) {
			const restoredAudio = deletedmusic[restoreIdx];
			try {
				await dispatch(restoreMusic(restoredAudio._id)).unwrap();
				await dispatch(getDeletedMusic()).unwrap();
			} catch (error) {
				console.log("error",error);
			}
		}
		setShowRestoreModal(false);
		setRestoreIdx(null);
	};

	const handleDeleteConfirm = async () => {
		if (deleteIdx !== null) {
		const musicToDelete = deletedmusic[deleteIdx];
		try {
			await dispatch(permanentDeleteMusic(musicToDelete._id)).unwrap();
		} catch (error) {
			console.log("error",error);
		}
		setShowDeleteModal(false);
		setDeleteIdx(null);
		}
	};

	const handleRestoreAllConfirm = async () => {
		try {
			await dispatch(restoreAllMusic()).unwrap();
			setShowRestoreAllModal(false);
		} catch (error) {
			console.log("error",error);
		}
	};

	const handleDeleteAllConfirm = async () => {
		try {
			await dispatch(permanentDeleteAllMusic()).unwrap();
			setShowDeleteAllModal(false);
		} catch (error) {
			console.log("error",error);
		}
	};

	// Handler for canceling restore modal
	const handleRestoreCancel = () => {
		setShowRestoreModal(false);
		setRestoreIdx(null);
	};
	
	const handlePermanentDeleteClick = (idx) => {
		setDeleteIdx(idx);
		setShowDeleteModal(true);
	};

	// const handleDeleteConfirm1 = () => {
	// 	if (deleteIdx !== null) {
	// 		const updatedDeleted = deletedAudios.filter((_, i) => i !== deleteIdx);
	// 		setDeletedAudios(updatedDeleted);
	// 		localStorage.setItem('deletedAudios', JSON.stringify(updatedDeleted));
	// 		setShowDeleteModal(false);
	// 		setDeleteIdx(null);
	// 	}
	// };

	const handleDeleteCancel = () => {
		setShowDeleteModal(false);
		setDeleteIdx(null);
	};

	return (
		<div className="p-3 lg:p-5 xl:p-6 2xl:p-8 3xl:p-10 bg-[#141414]">
			<div className="flex items-center py-3 cursor-pointer" onClick={() => navigate('/project')}>
				<FaChevronLeft className='w-4 h-4 text-[#FFFFFF99]' />
				<span className="text-[15px] font-bold ps-2 text-[#FFFFFF99]">Projects</span>
        	</div>
			<div className="flex items-center mb-2 gap-2">
				<h1 className="font-bold text-2xl text-gray-200 flex items-center">Recently deleted</h1>
				<Menu as="div" className="relative inline-block text-left">
					<MenuButton className="outline-none ml-1">
						<div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition">
							<HiDotsVertical className="text-gray-500 text-xl cursor-pointer" />
						</div>
					</MenuButton>
					<MenuItems className={`absolute left-1/2 transform -translate-x-1/2 mt-2 w-80 origin-top ${deletedmusic.length === 0 ? 'bg-[#232323]' : 'bg-[#181818]'} rounded-md shadow-lg z-50 py-3 ${deletedmusic.length === 0 ? 'pointer-events-none' : ''}`}> 
						<MenuItem disabled={deletedmusic.length === 0}>
							{({ active }) => (
								<button
									className={`w-full flex items-center gap-2 px-4 py-2 font-medium rounded ${deletedmusic.length === 0 ? 'text-gray-200 cursor-not-allowed bg-[#232323]' : 'text-white'} ${active && deletedmusic.length !== 0 ? 'bg-[#232323]' : ''}`}
									onClick={deletedmusic.length === 0 ? undefined : handleRestoreAll}
									disabled={deletedmusic.length === 0}
								>
									<span className="text-lg">&#8634;</span>
									Restore all projects
								</button>
							)}
						</MenuItem>
						<MenuItem disabled={deletedmusic.length === 0}>
							{({ active }) => (
								<button
									className={`w-full flex items-center gap-2 px-4 py-2 font-medium rounded ${deletedmusic.length === 0 ? 'text-gray-200 cursor-not-allowed bg-[#232323]' : 'text-[#ff3b3b]'} ${active && deletedmusic.length !== 0 ? 'bg-[#232323]' : ''}`}
									onClick={deletedmusic.length === 0 ? undefined : handlePermanentDeleteAll}
									disabled={deletedmusic.length === 0}
								>
									<FiTrash2 className={`${deletedmusic.length === 0 ? 'text-gray-400' : 'text-[#ff3b3b]'} text-lg`} />
									Permanently delete all projects
								</button>
							)}
						</MenuItem>
					</MenuItems>
			{/* Restore all projects modal */}
			{/* {showRestoreAllModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#fff] rounded-xl shadow-lg w-[440px] max-w-[95vw] flex flex-col relative" style={{padding: '32px 0 0 0'}}>
						<button
							className="absolute top-6 right-8 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleRestoreAllCancel}
							title="Close this message"
							aria-label="Close restore all projects message"
						>
							&times;
						</button>
						<div className="px-8 pb-0">
							<h2 className="font-bold text-2xl text-gray-900 mb-4">Restore all projects</h2>
							<p className="text-gray-800 mt-2 mb-2 text-base">Are you sure you want to restore all projects?</p>
							<p className="text-gray-700 mt-1 mb-2 text-sm">Restored projects will be moved back to the default project list. Collaborators and open invites are not restored.</p>
						</div>
						<div className="border-t mt-6 pt-6 px-8 pb-6 flex justify-end gap-4 bg-transparent">
							<button
								className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 text-base"
								onClick={handleRestoreAllCancel}
							>
								Cancel
							</button>
							<button
								className="px-6 py-2 rounded-full bg-[#6c2bd7] text-white font-semibold hover:bg-[#4b1fa3] text-base"
								onClick={handleRestoreAllConfirm}
							>
								Restore all projects
							</button>
						</div>
					</div>
				</div>
			)} */}
			{/* Restore Project Modal */}
			{showRestoreModal && restoreIdx !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#1F1F1F] rounded-xl shadow-lg p-8 w-full max-w-md relative mx-3">
						<button
							className="absolute top-4 right-4 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleRestoreCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-[18px] text-white mb-2">Restore "{deletedmusic[restoreIdx]?.name}"</h2>
						<p className="text-[#FFFFFF99] text-[15px] mt-2 mb-6">Restored projects will be moved back to the default project list. Collaborators and open invites are not restored.</p>
						<div className="flex justify-end gap-4 mt-6">
							<button
								className="d_btn d_cancelbtn"
								onClick={handleRestoreCancel}
							>
								Cancel
							</button>
							<button
								className="d_btn d_createbtn"
								onClick={handleRestoreConfirm}
							>
								Restore Project
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Permanently delete all projects modal */}
			{/* {showDeleteAllModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#fff] rounded-xl shadow-lg w-[440px] max-w-[95vw] flex flex-col relative" style={{padding: '32px 0 0 0'}}>
						<button
							className="absolute top-5 right-5 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleDeleteAllCancel}
							title="Close this message"
							aria-label="Close permanently delete all projects message"
						>
							&times;
						</button>
						<div className="px-8 pb-0">
							<h2 className="font-bold text-2xl text-gray-900 mb-4">Permanently delete all projects</h2>
							<p className="text-gray-800 mb-2 text-base">Are you sure you want to permanently delete all projects? This action cannot be undone.</p>
						</div>
						<div className="border-t mt-6 pt-6 px-8 pb-6 flex justify-end gap-4 bg-transparent">
							<button
								className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 text-base"
								onClick={handleDeleteAllCancel}
							>
								Cancel
							</button>
							<button
								className="px-6 py-2 rounded-full bg-[#d32f2f] text-white font-semibold hover:bg-[#b71c1c] text-base"
								onClick={handleDeleteAllConfirm}
							>
								Delete all projects
							</button>
						</div>
					</div>
				</div>
			)} */}
			{/* Permanently Delete Project Modal */}
			{showDeleteModal && deleteIdx !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#1F1F1F] rounded-xl shadow-lg p-8 w-full max-w-md relative mx-3">
						<button
							className="absolute top-4 right-4 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleDeleteCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-[18px] text-white mb-2">Permanently delete "{deletedmusic[deleteIdx]?.name}"</h2>
						<p className="text-[#FFFFFF99] text-[15px] text-center mt-2 mb-6">Are you sure you want to permanently delete this project? This action cannot be undone.</p>
						<div className="flex justify-end gap-4 mt-6">
							<button
								className="d_btn d_cancelbtn"
								onClick={handleDeleteCancel}
							>
								Cancel
							</button>
							<button
								className="d_btn d_deletebtn"
								onClick={handleDeleteConfirm}
							>
								Permanently delete
							</button>
						</div>
					</div>
				</div>
			)}
				</Menu>
			</div>
			<hr className="mt-4 my-1 border-gray-200" />
			<div>
				{loading ? (
					<div className="flex flex-col items-center justify-center py-16 px-4">
						<div className="text-center mt-1">
							<h3 className="text-lg font-medium text-gray-300 mb-1">Loading...</h3>
						</div>
					</div>
				) : deletedmusic.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16 px-4">
						<div className="relative">
							<img src={notFound} alt="No music" className='object-contain w-24 h-24' />
						</div>
						<div className="text-center mt-1">
							<h3 className="text-lg font-medium text-gray-300 mb-1">No Deleted Items.</h3>
						</div>
				  </div>
				) : (
					<div>
						{deletedmusic.map((audio, idx) => {
							console.log("object",deletedmusic)
							// Calculate days left
							let daysLeft = 30;
							if (audio.deletedAt) {
								daysLeft = Math.max(0, 30 - Math.floor((Date.now() - new Date(audio.deletedAt).getTime()) / (24 * 60 * 60 * 1000)));
							}
							return (
								<div key={idx} className="flex items-center justify-between py-4 border-b border-gray-200">
									<div className="flex items-center gap-4">
										<div className='w-8 h-8 bg-white rounded-sm overflow-hidden flex items-center justify-center'>
											<div 
												className="w-full h-full"
												style={{ backgroundColor: generateRandomColor(audio?._id || audio?.name || 'default') }}
												></div>
										</div>
										<span className="font-semibold text-md text-gray-200 md:text-base md:max-w-[15ch] sm:max-w-[15ch] lg:max-w-none break-words whitespace-normal inline-block">{audio.name}</span>
											<span className="text-gray-300 text-sm md:text-sm sm:text-xs">{daysLeft} days left</span>
									</div>
									<div className="flex gap-2">
										<button
											className="px-2 sm:px-4 py-1 sm:py-2 rounded border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-200 md:px-4 md:py-2 md:text-sm sm:text-xs"
											onClick={() => handleRestoreClick(idx)}
										>
											Restore
										</button>
										<button
											className="px-2 sm:px-4 py-1 sm:py-2 rounded bg-[#ff0000] text-white font-medium hover:bg-red-600 md:px-4 md:py-2 md:text-sm sm:text-xs"
											onClick={() => handlePermanentDeleteClick(idx)}
										>
											Permanently delete
										</button>
									</div>  
								</div>
							);
						})}
					</div>
				)}
			</div>

			
			{/* {showRestoreModal && restoreIdx !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#f5f5f5] rounded-xl shadow-lg p-8 w-full max-w-md relative">
						<button
							className="absolute top-4 right-4 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleRestoreCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-2xl text-gray-900 mb-2">Restore "{deletedAudios[restoreIdx]?.name}"</h2>
						<p className="text-gray-700 mt-4 mb-6">Restored projects will be moved back to the default project list. Collaborators and open invites are not restored.</p>
						<div className="flex justify-end gap-4 mt-6">
							<button
								className="px-5 py-2 rounded bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
								onClick={handleRestoreCancel}
							>
								Cancel
							</button>
							<button
								className="px-5 py-2 rounded bg-[#6c2bd7] text-white font-medium hover:bg-[#4b1fa3]"
								onClick={handleRestoreConfirm}
							>
								Restore project
							</button>
						</div>
					</div>
				</div>
			)} */}
			{/* Restore All Projects Modal */}
			
			{showRestoreAllModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#1F1F1F] rounded-xl shadow-lg p-8 w-full max-w-md relative">
						<button
							className="absolute top-4 right-4 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleRestoreAllCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-2xl text-white mb-2">Restore all projects</h2>
						<p className="text-[#FFFFFF99] mt-4 mb-6">Are you sure you want to restore all projects? Restored projects will be moved back to the default project list.</p>
						<div className="flex justify-end gap-4 mt-6">
							<button
								className="d_btn d_cancelbtn"
								onClick={handleRestoreAllCancel}
							>
								Cancel
							</button>
							<button
								className="d_btn d_createbtn"
								onClick={handleRestoreAllConfirm}
							>
								Restore all projects
							</button>
						</div>
					</div>
				</div>
			)}

			{/* {showDeleteModal && deleteIdx !== null && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#f5f5f5] rounded-xl shadow-lg p-8 w-full max-w-md relative">
						<button
							className="absolute top-4 right-3 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleDeleteCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-2xl text-gray-900 mb-2">Permanently delete {deletedAudios[deleteIdx]?.name}</h2>
						<p className="text-gray-700 mt-4 mb-6">Are you sure you want to permanently delete this project? This action cannot be undone.</p>
						<div className="flex justify-end gap-4 mt-6 border-t pt-6">
							<button
								className="px-5 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
								onClick={handleDeleteCancel}
							>
								Cancel
							</button>
							<button
								className="px-5 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600"
								onClick={handleDeleteConfirm}
							>
								Permanently delete
							</button>
						</div>
					</div>
				</div>
			)} */}

			{/* Permanently Delete All Projects Modal */}
			{showDeleteAllModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-[#1f1f1f] rounded-xl shadow-lg p-8 w-full max-w-md relative">
						<button
							className="absolute top-4 right-4 text-gray-400 text-2xl font-bold hover:text-gray-600"
							onClick={handleDeleteAllCancel}
						>
							&times;
						</button>
						<h2 className="font-bold text-2xl text-white mb-2">Permanently delete all projects</h2>
						<p className="text-[#FFFFFF99] mt-4 mb-6">Are you sure you want to permanently delete all projects? This action cannot be undone.</p>
						<div className="flex justify-end gap-4 mt-6">
							<button
								className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 text-base"
								onClick={handleDeleteAllCancel}
							>
								Cancel
							</button>
							<button
								className="px-6 py-2 rounded-full bg-[#ff3b3b] text-white font-semibold hover:bg-[#d32f2f] text-base"
								onClick={handleDeleteAllConfirm}
							>
								Permanently delete all
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default RecentlyDeleted;
