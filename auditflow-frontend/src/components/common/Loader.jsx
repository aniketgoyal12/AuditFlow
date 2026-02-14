// src/components/common/Loader/Loader.jsx
const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`} />
  );
};

export default Loader;