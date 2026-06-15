interface AlertProps {
  message: string;
}

export function ErrorAlert({ message }: AlertProps) {
  if (!message) return null;
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" }}
    >
      {message}
    </div>
  );
}

export function SuccessAlert({ message }: AlertProps) {
  if (!message) return null;
  return (
    <div
      className="px-4 py-3 rounded-lg text-sm"
      style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}
    >
      {message}
    </div>
  );
}
