import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ChangePassword = () => {
  return (
    <form>
      {["email", "old_password", "new_password"].map((field, i) => (
        <div key={i} className="flex flex-col gap-1 mb-3">
          <Label htmlFor={field}>{field.replace("_", " ")}</Label>
          <Input
            id={field}
            name={field}
            type={field.includes("password") ? "password" : "email"}
            placeholder={field.replace("_", " ")}
          />
        </div>
      ))}
      <Button className="mt-5">Submit</Button>
    </form>
  );
};

export default ChangePassword;
