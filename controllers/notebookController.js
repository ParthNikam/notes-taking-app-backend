import Notebook from "../models/Notebook.js";
import Section from "../models/Section.js";
import Page from "../models/Page.js";

// Get notebook details with sections
export const getNotebook = async (req, res) => {
  console.log("\n=== GET NOTEBOOK START ===");
  console.log("Notebook ID:", req.params.id);
  console.log("User ID:", req.user.userId);
  
  try {
    const notebookId = req.params.id;
    const userId = req.user.userId;
    
    // Get notebook and verify ownership
    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Notebook not found or access denied");
      return res.status(404).json({ message: "Notebook not found" });
    }
    
    // Get sections for this notebook
    const sections = await Section.find({ notebookId }).sort({ createdAt: -1 });
    
    console.log("Notebook found:", notebook.title);
    console.log("Sections count:", sections.length);
    console.log("=== GET NOTEBOOK SUCCESS ===");
    
    res.json({ notebook, sections });
    
  } catch (error) {
    console.log("=== GET NOTEBOOK ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new section
export const createSection = async (req, res) => {
  console.log("\n=== CREATE SECTION START ===");
  console.log("Request body:", req.body);
  console.log("Notebook ID:", req.params.id);
  console.log("User ID:", req.user.userId);
  
  try {
    const { title } = req.body;
    const notebookId = req.params.id;
    const userId = req.user.userId;
    
    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Notebook not found or access denied");
      return res.status(404).json({ message: "Notebook not found" });
    }
    
    // Create new section
    const newSection = new Section({
      notebookId,
      title
    });
    
    await newSection.save();
    console.log("New section created:", newSection);
    
    console.log("=== CREATE SECTION SUCCESS ===");
    res.json(newSection);
    
  } catch (error) {
    console.log("=== CREATE SECTION ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Couldn't create section", error: error.message });
  }
};

// Get section details with pages
export const getSection = async (req, res) => {
  console.log("\n=== GET SECTION START ===");
  console.log("Section ID:", req.params.sectionId);
  console.log("User ID:", req.user.userId);
  
  try {
    const sectionId = req.params.sectionId;
    const userId = req.user.userId;
    
    // Get section and verify ownership through notebook
    const section = await Section.findById(sectionId);
    if (!section) {
      console.log("ERROR: Section not found");
      return res.status(404).json({ message: "Section not found" });
    }
    
    // Verify notebook ownership
    const notebook = await Notebook.findOne({ _id: section.notebookId, userId });
    if (!notebook) {
      console.log("ERROR: Access denied to section");
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Get pages for this section
    const pages = await Page.find({ sectionId }).sort({ createdAt: -1 });
    
    console.log("Section found:", section.title);
    console.log("Pages count:", pages.length);
    console.log("=== GET SECTION SUCCESS ===");
    
    res.json({ section, pages });
    
  } catch (error) {
    console.log("=== GET SECTION ERROR ===");
    console.error("Error details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; 