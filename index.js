import dotenv from "dotenv";
dotenv.config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function setLightValues(brightness, colorTemp) {
  // Mock API call
  return {
    brightness: brightness,
    colorTemperature: colorTemp,
  };
}

const controlLightFunctionDeclaration = {
  name: "controlLight",
  parameters: {
    type: "OBJECT",
    description: "Set the brightness and color temperature of a room light.",
    properties: {
      brightness: {
        type: "NUMBER",
        description:
          "Light level from 0 to 100. Zero is off and 100 is full brightness.",
      },
      colorTemperature: {
        type: "STRING",
        description:
          "Color temperature of the light fixture which can be `daylight`, `cool` or `warm`.",
      },
    },
    required: ["brightness", "colorTemperature"],
  },
};

const functions = {
  controlLight: ({ brightness, colorTemp }) => {
    return setLightValues(brightness, colorTemp);
  },
};

const generativeModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  tools: {
    functionDeclarations: [controlLightFunctionDeclaration],
  },
});

// Chat Prompting with model

const chat = generativeModel.startChat();
const prompt = "Dim the light so that room feels cozy and warm.";

//Send the message to model
const result = await chat.sendMessage(prompt);

// For simiplicity, this uses the first function call found as we just had one function declaration.
const call = result.response.functionCalls()[0];

if (call) {
  // Call the executable function named in the function call
  // with the arguments specified in the function call and
  // let it call the hypothetical API.
  const apiResponse = await functions[call.name](call.args);
  const result2 = await chat.sendMessage([
    {
      functionResponse: {
        name: "controlLight",
        response: apiResponse,
      },
    },
  ]);

  //log the text response;
  console.log(result2.response.text());
}
