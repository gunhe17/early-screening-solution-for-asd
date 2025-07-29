import subprocess
from pathlib import Path


"""Command"""

def convert_bag_to_images(
    bag_file: str,
    output_dir: str
) -> bool:
    bag_path = Path(bag_file)
    if not bag_path.exists():
        raise Exception(f"BAG file not found: {bag_file}")
    
    if output_dir is None:
        output_dir = str(bag_path.parent / bag_path.stem)
    
    output_path = Path(output_dir)
    depth_dir = output_path / "depth_16bit"
    color_dir = output_path / "color"
    depth_dir.mkdir(parents=True, exist_ok=True)
    color_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting BAG file: {bag_file}")
    print(f"Output directory: {output_path}")
    
    rs_convert_exe = r"C:\Users\insighter\workspace\sdk\realsense\tools\rs-convert.exe"
    
    try:
        # Depth
        print("Converting depth frames...")
        depth_cmd = [
            rs_convert_exe,
            "-i", str(bag_path),
            "-p", str(depth_dir),
            "-d"
        ]
        subprocess.run(depth_cmd, check=True, capture_output=True, text=True)
        
        # Color
        print("Converting color frames...")
        color_cmd = [
            rs_convert_exe,
            "-i", str(bag_path),
            "-p", str(color_dir),
            "-c"
        ]
        subprocess.run(color_cmd, check=True, capture_output=True, text=True)

        # 결과 요약
        depth_count = len(list(depth_dir.glob("*.png")))
        color_count = len(list(color_dir.glob("*.png")))
        
        print(f"✓ Conversion completed")
        print(f"  Depth frames: {depth_count}")
        print(f"  Color frames: {color_count}")
        print(f"  Output: {output_path}")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print("[STDOUT]", e.stdout)
        print("[STDERR]", e.stderr)
        raise Exception(f"rs-convert failed: {e}")


"""CLI"""

def get_arguments():
    import argparse

    parser = argparse.ArgumentParser(description="Convert RealSense BAG file to PNG images")
    parser.add_argument("--bag_file", required=True, help="Path to BAG file")
    parser.add_argument("--output", type=str, help="Output directory")

    return parser.parse_args()

def main():
    args = get_arguments()
    
    try:
        convert_bag_to_images(
            bag_file=args.bag_file,
            output_dir=args.output
        )
        print("Conversion successful")
        
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()
