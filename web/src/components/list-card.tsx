import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";
import Link from "next/link";
import Image from "next/image";

const ListCard = ({
  title,
  description,
  cover_image,
  href,
  onClick,
}: {
  title: string;
  description: string;
  cover_image?: string;
  href?: string;
  onClick?: () => void;
}) => {
  const Component = href ? Link : "div";
  return (
    <Component href={href ?? ""} onClick={onClick}>
      <Card className="gap-0 overflow-hidden rounded-xl">
        {/* {topic.cover_image && ( */}
        <Image
          priority
          quality={100}
          src="/images/cover-image.png"
          // src={topic.cover_image}
          alt={`${title} cover image`}
          width={800}
          height={350}
          className="h-36 w-full object-center"
        />
        {/* )} */}
        <CardContent className="flex flex-col space-y-2 p-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Component>
  );
};

export default ListCard;
