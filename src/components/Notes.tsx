import React from "react";
import notesData from "../data/notes.json";

interface Note {
  id: number;
  title: string;
  content: string;
  items: string[];
  status: string;
}

export const Notes: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notes & Updates
      </h3>
      <div className="space-y-6">
        {notesData.notes.map((note: Note) => (
          <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{note.title}</h4>
            </div>
            <p className="text-gray-600 mb-2">{note.content}</p>
            <ul className="list-disc list-inside space-y-1">
              {note.items.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
