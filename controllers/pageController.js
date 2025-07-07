import Page from "../models/Page.js";
import Section from "../models/Section.js";
import Notebook from "../models/Notebook.js";

// Create a new page
export const createPage = async (req, res) => {
  console.log("\n=== CREATE PAGE START ===");
  console.log("Request body:", req.body);
  console.log("Section ID:", req.params.sectionId);
  console.log("User ID:", req.user.userId);
  
  try {
    const { title, content } = req.body;
    const sectionId = req.params.sectionId;
    const userId = req.user.userId;
    
    // Verify section ownership through notebook
    const section = await Section.findById(sectionId);
    if (!section) {
      console.log("ERROR: Section not found");
      return res.status(404).json({ message: "Section not found" });
    }
    
    const notebook = await Notebook.findOne({ _id: section.notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Access denied to section");
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Create new page
    const newPage = new Page({
      sectionId,
      title: title || "Untitled Page",
      content: content || ""
    });
    
    await newPage.save();
    console.log("New page created:", newPage);
    
    console.log("=== CREATE PAGE SUCCESS ===");
    res.json(newPage);
    
  } catch (error) {
    console.log("=== CREATE PAGE ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Couldn't create page", error: error.message });
  }
};

// Get page content
export const getPage = async (req, res) => {
  console.log("\n=== GET PAGE START ===");
  console.log("Page ID:", req.params.pageId);
  console.log("User ID:", req.user.userId);
  
  try {
    const pageId = req.params.pageId;
    const userId = req.user.userId;
    
    // Get page and verify ownership through section and notebook
    const page = await Page.findById(pageId);
    if (!page) {
      console.log("ERROR: Page not found");
      return res.status(404).json({ message: "Page not found" });
    }
    
    const section = await Section.findById(page.sectionId);
    if (!section) {
      console.log("ERROR: Section not found");
      return res.status(404).json({ message: "Section not found" });
    }
    
    const notebook = await Notebook.findOne({ _id: section.notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Access denied to page");
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log("Page found:", page.title);
    console.log("=== GET PAGE SUCCESS ===");
    
    res.json(page);
    
  } catch (error) {
    console.log("=== GET PAGE ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update page content
export const updatePage = async (req, res) => {
  console.log("\n=== UPDATE PAGE START ===");
  console.log("Request body:", req.body);
  console.log("Page ID:", req.params.pageId);
  console.log("User ID:", req.user.userId);
  
  try {
    const { title, content } = req.body;
    const pageId = req.params.pageId;
    const userId = req.user.userId;
    
    // Verify page ownership through section and notebook
    const page = await Page.findById(pageId);
    if (!page) {
      console.log("ERROR: Page not found");
      return res.status(404).json({ message: "Page not found" });
    }
    
    const section = await Section.findById(page.sectionId);
    if (!section) {
      console.log("ERROR: Section not found");
      return res.status(404).json({ message: "Section not found" });
    }
    
    const notebook = await Notebook.findOne({ _id: section.notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Access denied to page");
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Update page
    const updatedPage = await Page.findByIdAndUpdate(
      pageId,
      { title, content },
      { new: true }
    );
    
    console.log("Page updated:", updatedPage.title);
    console.log("=== UPDATE PAGE SUCCESS ===");
    
    res.json(updatedPage);
    
  } catch (error) {
    console.log("=== UPDATE PAGE ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Couldn't update page", error: error.message });
  }
}; 