"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function LoginFooter() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="pt-6 text-center"
    >
      <p className="text-sm text-muted-foreground">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-sm text-primary font-medium hover:underline">
          Registrarse
        </Link>
      </p>
    </motion.div>
  );
}
