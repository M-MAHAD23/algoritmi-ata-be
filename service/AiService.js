const { OPEN_AI_URL, OPEN_AI_KEY } = require("../config/env");

// Prepare course outline as JSON for the AI system message
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
};

// Prompt function to interact with the AI
exports.prompt = async (chatArray, entity) => {
    try {
        const chat = chatArray;
        // Extract the last user message from the chat array
        const userMessageObject = chatArray.slice().reverse().find(msg => msg.role === "User");
        if (!userMessageObject) {
            return { error: "No User message found to send to AI." };
        }
        const userMessage = userMessageObject.message;

        // const SYSTEM_MESSAGES = `You are provided with a course outline in JSON format: ${JSON.stringify(course)}. When responding to a "User" query, base your answers strictly on the course information provided. If the user asks for code or implementation details, do not provide code snippets. Instead, offer guidance and explanations relevant to their question.`;

        let SYSTEM_MESSAGES;

        if (entity === "Teacher") {
            SYSTEM_MESSAGES = `You are provided with a course outline in JSON format: ${JSON.stringify(course)}. When responding to a "User" query, base your answers strictly on the course information provided. Offer **guidance** **quizzes** **assignments** and **explanations** relevant to their question. Focus on helping the user make quizzes for course, and understanding the concepts, processes, and best practices without diving into specific implementations.

            In addition, you may answer questions related to:
            1. **Development**: Provide general insights on development practices, tools, methodologies, and best practices relevant to the course topic.
            2. **Tech Stacks**: Offer guidance on commonly used tech stacks in the field related to the course, explaining why certain stacks are preferred for specific tasks and what benefits they provide.
            3. **Trends**: Discuss current and emerging trends in technology that relate to the course material and explain their relevance to the field.
            4. **Career Guidance**: Offer advice on potential career paths, roles, and skills needed in the industry, with respect to the course content and the overall field, helping users understand the career opportunities available to them.
            
            Always ensure that your answers are grounded in the course material, providing **valuable insights** and actionable advice without resorting to specific code implementations. Make sure the user gains an understanding of the broader context rather than the details of the code itself.`;
        }
        else {
            SYSTEM_MESSAGES = `You are provided with a course outline in JSON format: ${JSON.stringify(course)}. When responding to a "User" query, base your answers strictly on the course information provided. If the user asks for code or implementation details, do not provide any code snippets. Instead, offer **guidance** and **explanations** relevant to their question. Focus on helping the user understand the concepts, processes, and best practices without diving into specific implementations.

            In addition, you may answer questions related to:
            1. **Development**: Provide general insights on development practices, tools, methodologies, and best practices relevant to the course topic.
            2. **Tech Stacks**: Offer guidance on commonly used tech stacks in the field related to the course, explaining why certain stacks are preferred for specific tasks and what benefits they provide.
            3. **Trends**: Discuss current and emerging trends in technology that relate to the course material and explain their relevance to the field.
            4. **Career Guidance**: Offer advice on potential career paths, roles, and skills needed in the industry, with respect to the course content and the overall field, helping users understand the career opportunities available to them.
            
            Always ensure that your answers are grounded in the course material, providing **valuable insights** and actionable advice without resorting to specific code implementations. Make sure the user gains an understanding of the broader context rather than the details of the code itself.`;
        }

        // Send request to AI
        // const response = await fetch(OPEN_AI_URL, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${OPEN_AI_KEY}`
        //     },
        //     body: JSON.stringify({
        //         model: "gpt-4o-mini",
        //         messages: [
        //             { role: "system", content: SYSTEM_MESSAGES },
        //             { role: "user", content: userMessage }
        //         ],
        //         temperature: 0,
        //         max_tokens: 2048,
        //         top_p: 1,
        //         frequency_penalty: 0,
        //         presence_penalty: 0
        //     })
        // });

        // const data = await response.json();

        // Add the AI's response to the chat array
        // const aiMessage = data.choices[0].message.content;
        chat.push({ role: "Model", message: "No" });

        // Return the updated chat array
        return chat;
    } catch (error) {
        console.error("Error in AI prompt:", error);
        throw new Error("Error processing AI prompt");
    }
};
