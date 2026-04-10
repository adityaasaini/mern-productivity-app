import TaskModel from '../models/Task.js';

// GET /api/tasks — scoped to authenticated user
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tasks = await TaskModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, result: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// GET /api/tasks/stats — quick insights for dashboard
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const total = await TaskModel.countDocuments({ userId });
    const completed = await TaskModel.countDocuments({ userId, isCompleted: true });
    res.status(200).json({ success: true, stats: { total, completed, pending: total - completed } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// POST /api/add-task — scoped to authenticated user
const addTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description required' });
    }
    const newTask = await TaskModel.create({ title, description, userId });
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// DELETE /api/delete/:id — user-owned only
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedTask = await TaskModel.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedTask) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// DELETE /api/delete-multiple — user-owned only
const deleteMultipleTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskIds } = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No tasks selected' });
    }
    const result = await TaskModel.deleteMany({ _id: { $in: taskIds }, userId });
    res.status(200).json({ success: true, message: `${result.deletedCount} tasks deleted` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// GET /api/task/:id — user-owned only
const getTaskById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const task = await TaskModel.findOne({ _id: req.params.id, userId });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, result: task });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// PUT /api/update-task/:id — user-owned only
const updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, isCompleted } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (isCompleted !== undefined) update.isCompleted = isCompleted;
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: req.params.id, userId },
      update,
      { new: true }
    );
    if (!updatedTask) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, result: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export { getAllTasks, addTask, deleteTask, deleteMultipleTasks, getTaskById, updateTask, getTaskStats };

