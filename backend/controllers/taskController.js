import Task from '../models/Task.js';
import { pushTaskToQueue } from '../config/redis.js';

export const createTask = async (req, res) => {
  try {
    const { title, inputText, operation } = req.body;

    if (!title || !inputText || !operation) {
      return res.status(400).json({ error: 'Please provide title, input text, and operation' });
    }

    const validOperations = ['uppercase', 'lowercase', 'reverse', 'word_count'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({ error: `Invalid operation. Supported: ${validOperations.join(', ')}` });
    }

    // Create task record with status 'pending'
    const task = await Task.create({
      title,
      inputText,
      operation,
      status: 'pending',
      userId: req.user._id,
      logs: [{ message: 'Task created and queued for background processing.' }]
    });

    // Push job ID to Redis queue
    await pushTaskToQueue(task._id);

    res.status(202).json({
      success: true,
      message: 'Task successfully queued',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create and queue task' });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .select('-inputText -result -logs') // Exclude heavy payloads for list view
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

export const getTaskDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    console.error('Get task details error:', error);
    res.status(500).json({ error: 'Failed to retrieve task details' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
