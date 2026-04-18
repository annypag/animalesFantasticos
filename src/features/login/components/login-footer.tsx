"use client";

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
        Don&apos;t have an account?{" "}
        <button type="button" className="p-0 text-sm text-primary">
          Sign up
        </button>
      </p>
    </motion.div>
  );
}
