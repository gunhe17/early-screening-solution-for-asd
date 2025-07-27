import os
from io import BytesIO
from openai import OpenAI

from imomtae.config import OpenAIConfig

openai_config = OpenAIConfig()


"""Command"""

def fetch(
    text: str,
    model: str = "gpt-4o-mini-tts",
    voice: str = "alloy",
    speed: float = 1.0
) -> BytesIO:
    
    # client
    client = OpenAI(
        api_key=openai_config.OPENAI_KEY,
        organization=openai_config.OPENAI_ORGANIZATION,
        project=openai_config.OPENAI_PROJECT,
    )
    
    # run
    try:
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            response_format='mp3',
            speed=speed
        )
        
        audio_stream = BytesIO(response.content)
        audio_stream.seek(0)
        return audio_stream
        
    except Exception as e:
        raise Exception(f"OpenAI API error: {str(e)}")


"""CLI"""

def get_arguments():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--text", type=str, required=True)
    parser.add_argument("--model", type=str, default="tts-1")
    parser.add_argument("--voice", type=str, default="alloy")
    parser.add_argument("--speed", type=float, default=1.0)

    args = parser.parse_args()
    return args

def main():
    args = get_arguments()
    
    audio_stream = fetch(
        text=args.text,
        model=args.model,
        voice=args.voice,
        speed=args.speed
    )
    
    # Save to file for CLI usage
    output_path = f"output.{args.format}"
    with open(output_path, "wb") as f:
        f.write(audio_stream.read())
    
    print(f"Audio saved to: {output_path}")

if __name__ == "__main__":
    main()