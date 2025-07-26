async run() {
    try {
        const audioBlob = await fetcher.openai("안녕하세요, 반갑습니다.");
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
        };

        // 대략적인 재생 시간 (ms 단위) 후 리턴
        await new Promise(resolve => setTimeout(resolve, 2500));

        return audio;
    } catch (error) {
        console.error('TTS playback failed:', error);
        throw error;
    }
}
