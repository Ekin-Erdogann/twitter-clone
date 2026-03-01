
import { Routes,Route } from 'react-router-dom'
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';
function App() {
  const { data:currentUser, isLoading } = useQuery({
	queryKey: ['currentUser'],
	queryFn: async () => {
		try {
			const response = await fetch('/api/auth/me');
			const data = await response.json();
			if (data.error) {
				return null;
			}
			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch user data');
			}
			return data;
			
		} catch (error) {
			throw new Error(error);
		}
		
  },retry: false,});
  if (isLoading) {
	return (<div className='h-screen flex justify-center items-center'>
		<LoadingSpinner size='lg' />
		</div>);
  }
	return (
		<div className='flex max-w-6xl mx-auto'>
			{currentUser && <Sidebar />}
			<Routes>
				<Route path='/' element={currentUser ? <HomePage /> : <LoginPage />} />
				<Route path='/signup' element={!currentUser ? <SignUpPage /> : <HomePage />} />
				<Route path='/login' element={!currentUser ? <LoginPage /> : <HomePage />} />
				<Route path='/notifications' element={currentUser ? <NotificationPage /> : <LoginPage />} />
				<Route path='/profile/:username' element={currentUser ? <ProfilePage /> : <LoginPage />} />
			</Routes>
			{currentUser && <RightPanel />}
			<Toaster/>
		</div>
	);
}

export default App
