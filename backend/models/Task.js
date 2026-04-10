// File Name: backend/models/Task.js
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    isCompleted: { 
        type: Boolean, 
        default: false
    }
}, { timestamps: true });

const TaskModel = mongoose.model('Task', taskSchema);

export default TaskModel;