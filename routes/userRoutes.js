import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { googleAuth, googleCallback, getProfile, changeSettings, createNotebook} from "../controllers/userController.js";
import { getNotebook, createSection, getSection } from "../controllers/notebookController.js";
import { createPage, getPage, updatePage } from "../controllers/pageController.js";

const router = express.Router();

// GET /api/auth/google - Redirect to Google
router.get('/google', googleAuth);

// GET /api/auth/google/callback - Handle Google callback
router.get('/google/callback', googleCallback);

// GET /api/auth/profile
router.get('/profile', authMiddleware, getProfile);

router.put('/settings', authMiddleware, changeSettings);



// Notebook routes
router.put('/notebook', authMiddleware, createNotebook);
router.get('/notebook/:id', authMiddleware, getNotebook);

// Section routes
router.post('/notebook/:id/section', authMiddleware, createSection);
router.get('/section/:sectionId', authMiddleware, getSection);

// Page routes
router.post('/section/:sectionId/page', authMiddleware, createPage);
router.get('/page/:pageId', authMiddleware, getPage);
router.put('/page/:pageId', authMiddleware, updatePage);

export default router;
