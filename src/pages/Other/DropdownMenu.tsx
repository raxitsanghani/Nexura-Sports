import { CreditCard, Github, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,

  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
//@ts-ignore
export function DropdownMenuComp({ profilePicUrl }) {
  const openGitHub = () => {
    window.open(
      "https://github.com/raxitsanghani",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <img
          src={
            profilePicUrl ||
            "https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShaggyMullet&accessoriesType=Sunglasses&hairColor=Black&facialHairType=BeardMajestic&facialHairColor=Black&clotheType=BlazerShirt&eyeType=Default&eyebrowType=AngryNatural&mouthType=Serious&skinColor=Light"
          }
          alt=""
          className="w-9 h-9 rounded-full mb-1 "
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>

          </DropdownMenuItem>
          <Link to={"/orders"}>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Orders</span>

            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Manually open GitHub link */}
        <DropdownMenuItem onClick={openGitHub}>
          <Github className="mr-2 h-4 w-4" />
          <span>GitHub</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>

        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
