const fs = require('fs');
const path = require('path');
const { Batch } = require('../model/BatchModel');
const { Assignment } = require('../model/AssignmentModel');

// Submit assignment
exports.submitAssignment = async (req, res) => {
    try {

        const { assignmentId, studentId } = req.body;



        res.status(200).json({ message: 'Assignment Submitted successfully', data: assignment });
    } catch (error) {
        res.status(500).json({ error: 'Error submitting assignment', details: error.message });
    }
};

// ATA Config
exports.ataConfig = async (req, res) => {
    try {
        // Define the path to ataConfig.json
        const configFilePath = path.join(__dirname, '../config/ataConfig.json');

        // Read ataConfig.json and parse it
        const ataConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

        const { reset } = req.query;

        // Check if reset is true
        if (reset === "true") {
            // Replace the 'settings' section with the 'reset' section
            ataConfig.settings = ataConfig.reset;
        } else if (req.body.settings) {
            // If reset is not true, replace settings with req.body.settings (if provided)
            ataConfig.settings = req.body.settings;
        }

        // Write the updated configuration back to ataConfig.json
        fs.writeFileSync(configFilePath, JSON.stringify(ataConfig, null, 2), 'utf8');

        res.status(200).json({ message: "ATA configured successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error creating chat", error: error.message });
    }
};

// Prompt
exports.prompt = async (req, res) => {
    try {
        const course = {
            "courseTitle": "Programming Fundamentals",
            "courseCode": "CC-112",
            "creditHours": 3,
            "category": "Computing Core",
            "prerequisite": "None",
            "coRequisite": "None",
            "followUpCourses": ["CC-211: Object Oriented Programming", "DI-322: Web Technologies"],
            "courseDescription": {
                "introduction": [
                    "Problem solving",
                    "Von-Neumann architecture",
                    "Programming",
                    "Compiler",
                    "Linker",
                    "Algorithms",
                    "Flowcharts/Pseudo Codes"
                ],
                "basicC++LanguageConstructs": [
                    "Data types",
                    "Variables and Constants",
                    "Operators and Expressions",
                    "Input and Output (I/O)",
                    "Formatted I/O",
                    "Arithmetic, comparison, and logical operators"
                ],
                "conditionalStatements": [
                    "Execution flow for conditional statements",
                    "If control structure",
                    "Multiple selection using switch and logical operators"
                ],
                "repetitiveStatements": [
                    "Execution flow for repetitive statements",
                    "Repetition using for and do while loops"
                ],
                "proceduralProgrammingInC": [
                    "Functions",
                    "Prototype",
                    "Parameters and arguments",
                    "Call by value and call by reference",
                    "Stack rolling and unrolling",
                    "Library and header files",
                    "Scope and lifetime of variables (storage classes)"
                ],
                "lists": [
                    "Memory organization of lists",
                    "Multi-dimensional lists"
                ],
                "compositeDataTypes": [
                    {
                        "type": "Arrays",
                        "details": [
                            "Definition",
                            "Processing",
                            "Passing array to a function",
                            "Multi-dimensional arrays"
                        ]
                    }
                ],
                "searchingAndSorting": [],
                "pointers": [
                    "Pointer definition",
                    "Pointer arithmetic",
                    "Constant pointers",
                    "Pointer and arrays"
                ],
                "strings": [
                    "String and character operations",
                    "Static and dynamic memory allocation"
                ],
                "userDefinedDataTypes": [
                    {
                        "type": "Structures",
                        "details": [
                            "Definition",
                            "Initialization",
                            "Accessing members of structures",
                            "Typedef",
                            "Union",
                            "Enumerations"
                        ]
                    }
                ],
                "fileProcessingInC": [
                    "Files and streams",
                    "Sequential Access File",
                    "File I/O operations",
                    "Random Access File",
                    "Secondary Storage I/O",
                    "Command Line Arguments"
                ]
            },
            "textBooks": [
                {
                    "title": "Starting out with C++: from control structures through objects",
                    "author": "Tony Gaddis",
                    "edition": "7th",
                    "publisher": "Addison-Wesley",
                }
            ],
            "referenceMaterials": [
                {
                    "title": "C++ Programming, From Problem Analysis to Program Design",
                    "author": "D.S. Malik",
                    "edition": "5th",
                    "publisher": "Course Technology",
                },
                {
                    "title": "The C Programming Language",
                    "author": ["Brian W. Kernighan", "Dennis M. Ritchie"],
                    "edition": "2nd",
                    "publisher": "Prentice Hall",
                },
                {
                    "title": "The C++ Programming Language",
                    "author": "Bjarne Stroustrup",
                    "edition": "4th",
                    "publisher": "Addison-Wesley",
                }
            ]
        }

        const SYSTEM_MESSAGES = `Here is the course outline in JSON: ${{ course }}. Answer the "user" query according to the course given in JSON, Never give the code of program if they as but guide them acording to their query.`

        const response = await fetch(OPEN_AI_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPEN_AI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                // model: "gpt-3.5-turbo-1106",
                messages: [
                    { role: "system", content: [{ text: SYSTEM_MESSAGES, type: "text" }] },
                    { role: "user", content: [{ text: userMessage, type: "text" }] }
                ],
                temperature: 0,
                max_tokens: 256,
                top_p: 0.001,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });

        const data = await response.json();

        res.status(200).json({ message: 'Here is Response.', data: data });
    } catch (error) {
        res.status(500).json({ error: 'Error:', data: error.message });
    }
};
