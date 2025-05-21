// User types
export const User = {
  id: 0,
  uid: '',
  email: '',
  displayName: null,
  photoURL: null,
  createdAt: '',
  updatedAt: '',
  balance: 0,
};

export const UserBasic = {
  id: 0,
  uid: '',
  displayName: null,
  photoURL: null,
};

// File types
export const FileType = {
  id: 0,
  userId: 0,
  title: '',
  description: null,
  fileName: '',
  fileSize: 0,
  fileType: '',
  downloadUrl: '',
  shareUrl: '',
  tags: [],
  downloads: 0,
  rating: 0,
  totalRatings: 0,
  createdAt: '',
  updatedAt: '',
};

export const FileWithUser = {
  ...FileType,
  user: UserBasic,
};

export const FileDetailType = {
  ...FileType,
  user: UserBasic,
  comments: [],
};

// Comment types
export const CommentType = {
  id: 0,
  fileId: 0,
  userId: 0,
  comment: '',
  rating: 0,
  createdAt: '',
  user: UserBasic,
};

// Download types
export const DownloadType = {
  id: 0,
  fileId: 0,
  userId: null,
  ipAddress: '',
  userAgent: '',
  earnings: 0,
  createdAt: '',
};

// Payment types
export const PaymentType = {
  id: 0,
  userId: 0,
  amount: 0,
  status: 'pending',
  paymentMethod: '',
  transactionId: null,
  details: null,
  createdAt: '',
  completedAt: null,
};

// Stats types
export const UserStats = {
  totalFiles: 0,
  totalDownloads: 0,
  totalEarnings: 0,
};

// Upload types
export const UploadFormData = {
  title: '',
  description: '',
  tags: [],
  file: null,
};
